pragma solidity ^0.4.15;

// ----------------------------------------------------------------------------
//
// GAMES 'Gaming Star' token public sale contract
//
// For details, please visit: https://gaming-stars.net
//
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
//
// SafeMath3
//
// Adapted from https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/contracts/math/SafeMath.sol
// (no need to implement division)
//
// ----------------------------------------------------------------------------

library SafeMath3 {

  function mul(uint a, uint b) internal constant
    returns (uint c)
  {
    c = a * b;
    assert( a == 0 || c / a == b );
  }

  function sub(uint a, uint b) internal constant
    returns (uint)
  {
    assert( b <= a );
    return a - b;
  }

  function add(uint a, uint b) internal constant
    returns (uint c)
  {
    c = a + b;
    assert( c >= a );
  }

}


// ----------------------------------------------------------------------------
//
// Owned contract
//
// ----------------------------------------------------------------------------

contract Owned {

  address public owner;
  address public newOwner;

  // Events ---------------------------

  event OwnershipTransferProposed(
    address indexed _from,
    address indexed _to
  );

  event OwnershipTransferred(
    address indexed _from,
    address indexed _to
  );

  // Modifier -------------------------

  modifier onlyOwner
  {
    require( msg.sender == owner );
    _;
  }

  // Functions ------------------------

  function Owned()
  {
    owner = msg.sender;
  }

  function transferOwnership(address _newOwner) onlyOwner
  {
    require( _newOwner != owner );
    require( _newOwner != address(0x0) );
    OwnershipTransferProposed(owner, _newOwner);
    newOwner = _newOwner;
  }

  function acceptOwnership()
  {
    require(msg.sender == newOwner);
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}


// ----------------------------------------------------------------------------
//
// ERC Token Standard #20 Interface
// https://github.com/ethereum/EIPs/issues/20
//
// ----------------------------------------------------------------------------

contract ERC20Interface {

  // Events ---------------------------

  event Transfer(
    address indexed _from,
    address indexed _to,
    uint _value
  );

  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint _value
  );

  // Functions ------------------------

  function totalSupply() constant
    returns (uint);

  function balanceOf(address _owner) constant
    returns (uint balance);

  function transfer(address _to, uint _value)
    returns (bool success);

  function transferFrom(address _from, address _to, uint _value)
    returns (bool success);

  function approve(address _spender, uint _value)
    returns (bool success);

  function allowance(address _owner, address _spender) constant
    returns (uint remaining);

}


// ----------------------------------------------------------------------------
//
// ERC Token Standard #20
//
// note that totalSupply() is not defined here
//
// ----------------------------------------------------------------------------

contract ERC20Token is ERC20Interface, Owned {

  using SafeMath3 for uint;

  mapping(address => uint) balances;
  mapping(address => mapping (address => uint)) allowed;

  // Functions ------------------------

  /* Get the account balance for an address */

  function balanceOf(address _owner) constant
    returns (uint balance)
  {
    return balances[_owner];
  }

  /* Transfer the balance from owner's account to another account */

  function transfer(address _to, uint _amount)
    returns (bool success)
  {
    // Amount sent cannot exceed balance
    require( balances[msg.sender] >= _amount );

    // update balances
    balances[msg.sender] = balances[msg.sender].sub(_amount);
    balances[_to]        = balances[_to].add(_amount);

    // Log event
    Transfer(msg.sender, _to, _amount);
    return true;
  }

  /* Allow _spender to withdraw from your account up to _amount */

  function approve(address _spender, uint _amount)
    returns (bool success)
  {
    // before changing the approve amount for an address, its allowance
    // must be reset to 0 to mitigate the race condition described here:
    // cf https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require( _amount == 0 || allowed[msg.sender][_spender] == 0 );

    // Approval amount cannot exceed the balance
    require ( balances[msg.sender] >= _amount );

    // Update allowed amount
    allowed[msg.sender][_spender] = _amount;

    // Log event
    Approval(msg.sender, _spender, _amount);
    return true;
  }

  /* Spender of tokens transfers tokens from the owner's balance */
  /* Must be pre-approved by owner */

  function transferFrom(address _from, address _to, uint _amount)
    returns (bool success)
  {
    // Balance checks
    require( balances[_from] >= _amount );
    require( allowed[_from][msg.sender] >= _amount );

    // Update balances and allowed amount
    balances[_from]            = balances[_from].sub(_amount);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
    balances[_to]              = balances[_to].add(_amount);

    // Log event
    Transfer(_from, _to, _amount);
    return true;
  }

  /* Returns the amount of tokens approved by the owner */
  /* that can be transferred by spender */

  function allowance(address _owner, address _spender) constant
    returns (uint remaining)
  {
    return allowed[_owner][_spender];
  }

}


// ----------------------------------------------------------------------------
//
// GAMES public token sale
//
// ----------------------------------------------------------------------------

contract GamesToken is ERC20Token {

  /* Utility variables */

  uint constant E6  = 10**6;
  uint constant E18 = 10**18; // same as 1 ether

  /* Basic token data */

  string public constant name = "Gaming Stars Token";
  string public constant symbol = "GAMES";
  uint8  public constant decimals = 6;

  /* Wallet address - initially set to owner at deployment */

  address public wallet;

  /* Token volumes */

  uint public constant TOKEN_PROPORTION_CROWD   =  50; // 50% of tokens
  uint public constant TOKEN_PROPORTION_TEAM    =  20; // 20% of tokens
  uint public constant TOKEN_PROPORTION_RESERVE =  30; // 30% of tokens

  /* General crowdsale parameters */

  uint public constant MIN_CONTRIBUTION = 1 ether / 100; // 0.01 Ether
  uint public constant LOCKUP_PERIOD = 360 days;

  /* Presale parameters */

  uint public constant DATE_PRESALE_START = 1509105600; // 27-Oct-2017 12:00 UTC
  uint public constant DATE_PRESALE_END   = 1510315200; // 10-Nov-2017 12:00 UTC

  uint public constant TOKETH_PRESALE_ONE   = 2000 * E6; // day 1 = 50% discount
  uint public constant TOKETH_PRESALE_TWO   = 1818 * E6; // day 2 ~ 45% discount
  uint public constant TOKETH_PRESALE_THREE = 1667 * E6; // day 3 ~ 40% discount
  uint public constant TOKETH_PRESALE_FOUR  = 1538 * E6; // later ~ 35% discount

  uint public constant FUNDING_CAP_PRESALE = 3333 ether;

  /* ICO parameters (some can be modified by owner after deployment) */

  uint public dateICOStart = 1511438400; // 23-Nov-2017 12:00 UTC
  uint public dateICOEnd   = 1514030400; // 23-Dec-2017 12:00 UTC

  uint public constant TOKETH_ICO_ONE = 1250 * E6; // first two days = 20% discount
  uint public constant TOKETH_ICO_TWO = 1000 * E6;

  uint public FUNDING_THRESHOLD_ICO = 3333 ether;
  uint public fundingCapICO = 83333 ether;

  /* Crowdsale variables */

  uint public tokensIssuedTotal = 0;
  uint public tokensIssuedCrowd = 0; // = tokensIssuedPresale + tokensIssuedIco
  uint public tokensIssuedTeam = 0;
  uint public tokensIssuedReserve = 0;

  uint public tokensIssuedPresale = 0;
  uint public tokensIssuedIco = 0;

  uint public lockupEndDate = DATE_PRESALE_START + LOCKUP_PERIOD;

  bool public softCapReached = false;
  uint public softCapReachedDate = 0;

  bool public tradeable = false;

  /* Crowdsale variables - for reclaims */

  uint public presaleEtherCrowd = 0;
  uint public presaleEtherWithdrawn = 0;
  uint public presaleEtherReclaimed = 0;
  uint public presaleTokensDestroyed = 0;

  uint public icoEtherCrowd = 0;
  uint public icoEtherReclaimed = 0;
  uint public icoTokensDestroyed = 0;

  /* Mappings to keep track of Ether received and tokens issued during presale and ICO */

  mapping(address => uint) public balancesPresale;
  mapping(address => uint) public balancesIco;

  mapping(address => uint) public balanceEthPresale;
  mapping(address => uint) public balanceEthIco;

  mapping(address => bool) public fundsReclaimed;

  /* Balances subject to lockup period */

  mapping(address => uint) balancesLocked;

  // Events ---------------------------

  event WalletUpdated(
    address _newWallet
  );

  event DatesIcoUpdated(
    uint _start,
    uint _end
  );

  event FundingCapIcoUpdated(
    uint _cap
  );

  event TokensIssued(
    address indexed _owner,
    uint _tokens,
    uint _balance,
    uint _amount,
    uint _tokensIssuedCrowd
  );

  event TokensMintedTeam(
    address indexed _owner,
    bool _locked,
    uint _tokens,
    uint _balance,
    uint _tokensIssuedTeam
  );

  event TokensMintedReserve(
    address indexed _owner,
    uint _tokens,
    uint _balance,
    uint _tokensIssuedTeam
  );

  event FundsReclaimed(
    address indexed _owner,
    uint _etherReclaimed,
    uint _tokensDestroyed,
    uint _etherNotReclaimed,
    uint _tokenBalance
  );

  // Basic functions ------------------

  /* Initialize */

  function GamesToken()
  {
    require( TOKEN_PROPORTION_CROWD + TOKEN_PROPORTION_TEAM + TOKEN_PROPORTION_RESERVE == 100 );
    wallet = owner; // owner is set in Owned.Owned()
  }

  /* Fallback */

  function () payable
  {
    buyTokens();
  }

  // Information functions ------------

  /* What time is it? */

  function atNow() constant
    returns (uint)
  {
    return now;
  }

  /* Part of the balance that is locked */

  function lockedBalance(address _owner) constant
    returns (uint)
  {
    if (atNow() > lockupEndDate) return 0;
    return balancesLocked[_owner];
  }

  /* Are we in "extra time" after soft cap was reached? */

  function isExtraTime() constant
    returns (bool)
  {
    if (softCapReached && atNow() < softCapReachedDate + 2 days) return true;
    return false;
  }

  /* Is the ICO over? */

  function isIcoFinished() constant
    returns (bool)
  {
    if (!softCapReached && atNow() < dateICOEnd) return false;
    if (isExtraTime()) return false;
    return true;
  }

  /* Has the ICO funding threshold been reached? */

  function isIcoThresholdReached() constant
    returns (bool)
  {
    uint presaleRemains = presaleEtherCrowd.sub(presaleEtherWithdrawn);
    if(icoEtherCrowd.add(presaleRemains) >= FUNDING_THRESHOLD_ICO) return true;
    return false;
  }

  // Owner Functions ------------------

  /* Change the crowdsale wallet address */

  function setWallet(address _wallet) onlyOwner
  {
    require( _wallet != address(0x0) );
    wallet = _wallet;
    WalletUpdated(wallet);
  }

  /* Change ICO start date */

  function updateDateIcoStart(uint _start) onlyOwner
  {
    // sanity check #1: the new date must be in the future
    require( _start > atNow() );

    // sanity check #2: must be 180 days after presale start
    require( _start < DATE_PRESALE_START + 180 days );

    // the ICO start date can be modified only before the ICO starts
    require( atNow() < dateICOStart );

    // the new date must be between presale end and ICO end dates
    require( _start > DATE_PRESALE_END );
    require( _start < dateICOEnd );

    // set new ICO start date
    dateICOStart = _start;
    DatesIcoUpdated(_start, 0);
  }

  /* Change ICO end dates (can be done before ICO end) */

  function updateIcoDateEnd(uint _end) onlyOwner
  {
    // sanity check #1: the new date must be in the future
    require( _end > atNow() );

    // sanity check #2: must be 180 days after presale start
    require( _end < DATE_PRESALE_START + 180 days );

    // the ICO end date cannot be modified
    // - if the ICO is already over
    // - or the ICO is in extra time
    require( !isIcoFinished() );
    require( !isExtraTime() );

    // the new end date must be after the start date
    require( _end > dateICOStart );

    // set new ICO end date
    dateICOEnd = _end;
    DatesIcoUpdated(0, _end);
  }

  /* Change ICO funding cap (can be done before ICO end) */

  function updateFundingCapIco(uint _cap) onlyOwner
  {
    // the ICO funding cap cannot be modified
    // - if the ICO is already over
    // - or the ICO is in extra time
    require( !isIcoFinished() );
    require( !isExtraTime() );

    // sanity check: new amount must be between 10,000 and 1,000,000 Ether
    require( _cap > 10000 ether && _cap < 1000000 ether );

    // set new funding cap
    fundingCapICO = _cap;
    FundingCapIcoUpdated(_cap);
  }

  /* Minting of reserve tokens by owner (no lockup period) */

  function mintReserve(address _participant, uint _tokens) onlyOwner
  {
    // check if there is enough capacity
    uint limit = tokensIssuedCrowd.mul(TOKEN_PROPORTION_RESERVE) / 50;
    require( _tokens <= limit.sub(tokensIssuedReserve) );

    // mint and log
    balances[_participant] = balances[_participant].add(_tokens);
    tokensIssuedReserve    = tokensIssuedReserve.add(_tokens);
    tokensIssuedTotal      = tokensIssuedTotal.add(_tokens);

    // log event
    Transfer(0x0, _participant, _tokens);
    TokensMintedReserve(_participant, _tokens, balances[_participant], tokensIssuedReserve);
  }

  /* Minting of team (locked) and advisor (unlocked) tokens by owner */

  function mintTeamLocked(address _participant, uint _tokens) onlyOwner
  {
    mintTeam(_participant, _tokens, true);
  }

  function mintTeamUnlocked(address _participant, uint _tokens) onlyOwner
  {
    mintTeam(_participant, _tokens, false);
  }

  function mintTeam(address _participant, uint _tokens, bool _locked) internal
  {
    // check if there is enough capacity
    uint limit = tokensIssuedCrowd.mul(TOKEN_PROPORTION_TEAM) / 50;
    require( _tokens <= limit.sub(tokensIssuedTeam) );

    // lock if necessary
    if (_locked) balancesLocked[_participant] = balancesLocked[_participant].add(_tokens);

    // mint
    balances[_participant] = balances[_participant].add(_tokens);
    tokensIssuedTeam       = tokensIssuedTeam.add(_tokens);
    tokensIssuedTotal      = tokensIssuedTotal.add(_tokens);

    // log event
    Transfer(0x0, _participant, _tokens);
    TokensMintedTeam(_participant, _locked, _tokens, balances[_participant], tokensIssuedTeam);
  }

  /* Make tokens tradeable */

  function makeTradeable() onlyOwner
  {
    // the token can only be made tradeable after ICO finishes
    require( isIcoFinished() );
    tradeable = true;
  }

  /* Owner withdrawal */

  function ownerWithdraw(uint _amount) onlyOwner
  {
    require( _amount <= this.balance );

    // after ICO starts, withdrawals only if funding threshold reached
    require( atNow() < dateICOStart  || isIcoThresholdReached() );

    // register withdrawals befor ICO
    if (atNow() < dateICOStart) presaleEtherWithdrawn = presaleEtherWithdrawn.add(_amount);

    wallet.transfer(_amount);
  }

  /* Transfer out any accidentally sent ERC20 tokens */

  function transferAnyERC20Token(address tokenAddress, uint amount) onlyOwner
    returns (bool success)
  {
      return ERC20Interface(tokenAddress).transfer(owner, amount);
  }

  /* Accept ETH during crowdsale (called by fallback function) */

  function buyTokens() private
  {
    uint ts = atNow();
    bool isPresale = false;
    bool isIco = false;
    uint tokens = 0;

    // basic
    require( !isIcoFinished() );
    require( msg.value >= MIN_CONTRIBUTION );

    // check dates for presale or ICO
    if (ts > DATE_PRESALE_START && ts < DATE_PRESALE_END) {
      isPresale = true;
    }
    else if (ts > dateICOStart && !isIcoFinished()) {
      isIco = true;
    }
    require( isPresale || isIco );

    // Presale - funding cap applies
    //
    if (isPresale)
    {
      require( icoEtherCrowd.add(msg.value) <= FUNDING_CAP_PRESALE );

      if (atNow() < DATE_PRESALE_START + 1 days) {
        // first day
        tokens = TOKETH_PRESALE_ONE.mul(msg.value) / E18;
      }
      else if (atNow() < DATE_PRESALE_START + 2 days) {
        // second day
        tokens = TOKETH_PRESALE_TWO.mul(msg.value) / E18;
      }
      else if (atNow() < DATE_PRESALE_START + 3 days) {
        // third day
        tokens = TOKETH_PRESALE_THREE.mul(msg.value) / E18;
      }
      else {
        // after the third day
        tokens = TOKETH_PRESALE_FOUR.mul(msg.value) / E18;
      }
    }

    // ICO - soft cap check is done in the issueTokens function
    //
    if (isIco)
    {
      if (atNow() < dateICOStart + 2 days) {
        // first two days
        tokens = TOKETH_ICO_ONE.mul(msg.value) / E18;
      }
      else {
        // after the second day
        tokens = TOKETH_ICO_TWO.mul(msg.value) / E18;
      }
    }

    // issue tokens and update balances
    balances[msg.sender]   = balances[msg.sender].add(tokens);
    tokensIssuedTotal      = tokensIssuedTotal.add(tokens);
    tokensIssuedCrowd      = tokensIssuedCrowd.add(tokens);

    // keep track of tokens issued and Ethers contributes
    if (isPresale) {
      balancesPresale[msg.sender]   = balancesPresale[msg.sender].add(tokens);
      tokensIssuedPresale           = tokensIssuedPresale.add(tokens);
      balanceEthPresale[msg.sender] = balanceEthPresale[msg.sender].add(msg.value);
      presaleEtherCrowd             = presaleEtherCrowd.add(msg.value);
    }

    if (isIco) {
      balancesIco[msg.sender]   = balancesPresale[msg.sender].add(tokens);
      tokensIssuedIco           = tokensIssuedIco.add(tokens);
      balanceEthIco[msg.sender] = balanceEthPresale[msg.sender].add(msg.value);
      icoEtherCrowd             = icoEtherCrowd.add(msg.value);
    }

    // Log token issuance
    Transfer(0x0, msg.sender, tokens);
    TokensIssued(msg.sender, tokens, balances[msg.sender], msg.value, tokensIssuedCrowd);

    // check if soft cap has been reached
    if (!softCapReached && icoEtherCrowd >= fundingCapICO) {
      softCapReached = true;
      softCapReachedDate = atNow();
    }
  }

  /* Reclaim funds in case if failed ICO */

  function reclaimFunds()
  {
    require( isIcoFinished() && !isIcoThresholdReached() );
    require( !fundsReclaimed[msg.sender] );

    // ICO: return all ethers contributed
    uint reclaimedIco = balanceEthIco[msg.sender];
    icoEtherReclaimed = icoEtherReclaimed.add(reclaimedIco);

    // ICO: destroy tokens
    uint destroyedIco = balancesIco[msg.sender];
    balances[msg.sender] = balances[msg.sender].sub(destroyedIco);
    icoTokensDestroyed = icoTokensDestroyed.add(destroyedIco);

    // Presale: return ether sent during presale, depending on how much was withdrawn
    uint reclaimedPresale = balanceEthPresale[msg.sender].mul( presaleEtherCrowd.sub(presaleEtherWithdrawn) ) / presaleEtherCrowd;
    presaleEtherReclaimed  = presaleEtherReclaimed.add(reclaimedPresale);

    // Presale: destroy tokens
    uint destroyedPresale = balancesPresale[msg.sender].mul( presaleEtherCrowd.sub(presaleEtherWithdrawn) ) / presaleEtherCrowd;
    balances[msg.sender] = balances[msg.sender].sub(destroyedPresale);
    presaleTokensDestroyed = presaleTokensDestroyed.add(destroyedPresale);

    // mark as reclaimed (NB we keep presale and ICO balances intact)
    fundsReclaimed[msg.sender] = true;

    // log & refund
    uint reclaimedTotal = reclaimedIco.add(reclaimedPresale);
    uint destroyedTotal = destroyedIco.add(destroyedPresale);
    uint notReclaimed = balanceEthPresale[msg.sender].sub(reclaimedPresale);
    FundsReclaimed(msg.sender, reclaimedTotal, destroyedTotal, notReclaimed, balances[msg.sender]);
    msg.sender.transfer(reclaimedTotal);
  }


  // ERC20 functions ------------------

  /* Implement totalSupply() ERC20 function */

  function totalSupply() constant
    returns (uint)
  {
    return tokensIssuedTotal - presaleTokensDestroyed - icoTokensDestroyed;
  }

  /* Override "transfer" (ERC20) */

  function transfer(address _to, uint _amount)
    returns (bool success)
  {
    // cannot transfer out until tradeable, except for owner
    require( tradeable || msg.sender == owner );

    // locked balance check
    require( balances[msg.sender].sub(_amount) >= lockedBalance(msg.sender) );

    return super.transfer(_to, _amount);
  }

  /* Override "transferFrom" (ERC20) */

  function transferFrom(address _from, address _to, uint _amount)
    returns (bool success)
  {
    // not possible until tradeable
    require( tradeable );

    // locked balance check
    require( balances[_from].sub(_amount) >= lockedBalance(_from) );

    return super.transferFrom(_from, _to, _amount);
  }

}
