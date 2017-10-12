# Contract Audit: BlockMason

## Preamble
This audit report was undertaken by @adamdossa for the purpose of providing feedback to BlockMason. It has been written without any express or implied warranty.

The contract reviewed was the verified Solidity code found at:  
https://github.com/Gaming-Stars/GamesToken/tree/243004104681dfdfa09386da785672d64d62053c

## Summary

I have worked with Alex Kampa (the developer of this contract) over the last week to ensure the contract code is well-structured, performs as intended, and is secure.

During this process:  
  - the contracts were placed into the Truffle build environment
  - 40 unit tests were written covering the major contract functionality
  - code was cleaned up
  - bugs were found and fixed

By the end of this process I am confident that the code performs as advertised, with the comments below reflecting points to note rather than security issues.

I would recommend a second independent audit of the code to improve the likelihood of their being no further issues in the code.

## Contract Audit

### GamesToken.sol

This contract represents functionality to run the crowd sale, maintain token balances and issue refunds.

The contract uses standard implementations of SafeMath, Ownable and ERC20 interfaces.

**Comment**

This contract uses SafeMath for most numeric calculations, but there are still some calculations which use native maths operations which could be subject to overflow. These operations should be safe as they are dealing with known or controlled quantities, but there is no real downside to using SafeMath throughout to remove any doubt.

**Comment**

The refund functionality is not entirely trustless. The contract owner can withdraw up to 100% of the ETH sent to the contract during the pre-sale, meaning pre-sale contributors could be unable to get a full refund. This functionality is purposefully implemented this way, but worth noting. For any partial refunds, pre-sale contributors would retain a corresponding token balance (i.e. only a corresponding amount of tokens will be burnt).

**Comment**

The contract owner can change the funding cap after the pre-sale (but before the sale starts). This is somewhat unusual as it will mean that pre-sale participants aren't guaranteed an upper bound on the token total supply.

## Tests Audit

All tests execute successfully, and cover off on the major functionality of the contract.

```
Using network 'development'.

Compiling ./contracts/GamesToken.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/mock/GamesTokenMock.sol...


  Contract: Check Initialisation
    ✓ 0. check initialized token (80ms)

  Contract: Check Variable Changes
    ✓ 0. change wallet address (79ms)
    ✓ 1. change start ico time (144ms)
    ✓ 1. change end ico time (162ms)
    ✓ 2. change funding cap (176ms)

  Contract: Make Pre-Sale Purchases
    ✓ 0. purchase in first day (114ms)
    ✓ 1. purchase in second day (108ms)
    ✓ 2. purchase in third day (100ms)
    ✓ 3. purchase in fourth day (178ms)
    ✓ 4. unable to purchase under minimum cap
    ✓ 5. unable to breach max pre-sale cap

  Contract: Make Sale Purchases
    ✓ 0. purchase in sale first two days (159ms)
    ✓ 1. purchase in second day (126ms)
    ✓ 2. unable to purchase under minimum cap
    ✓ 3. reach max sale cap (172ms)
    ✓ 4. able to make purchase during extra time (55ms)
    ✓ 5. unable to make purchases after extra time finishes (115ms)
    ✓ 6. check can transfer tokens (128ms)

  Contract: Minting Reserve Tokens
    ✓ 0. investors purchase some tokens during pre-sale (193ms)
    ✓ 1. reserve tokens minted during pre-sale (114ms)
    ✓ 2. more tokens bought, more reserve tokens minted during pre-sale (189ms)
    ✓ 3. more tokens bought sale, more reserve tokens minted during sale (232ms)
    ✓ 4. cap met, more reserve tokens minted (228ms)
    ✓ 5. ICO finished, more reserve tokens minted (181ms)
    ✓ 6. check can transfer reserve tokens (119ms)

  Contract: Minting Team Tokens
    ✓ 0. investors purchase some tokens during pre-sale (274ms)
    ✓ 1. team tokens minted during pre-sale (152ms)
    ✓ 2. more tokens bought, more team tokens minted during pre-sale (220ms)
    ✓ 3. more tokens bought sale, more team tokens minted during sale (253ms)
    ✓ 4. cap met, more team tokens minted (289ms)
    ✓ 5. ICO finished, more team tokens minted (253ms)
    ✓ 6. check can transfer team unlocked tokens (136ms)
    ✓ 7. check can not transfer team locked tokens
    ✓ 8. check can transfer team locked tokens after lock up period (186ms)

  Contract: Check Refunds And Withdrawals
    ✓ 0. purchase in pre-sale first day (177ms)
    ✓ 1. owner withdraws 25% of pre-sale ETH (294ms)
    ✓ 2. owner changes wallet address, withdraws 25% of pre-sale ETH (276ms)
    ✓ 3. investors purchase during sale, ether can't be withdrawn (155ms)
    ✓ 4. ICO fails, pre-sale investors get partial refunds (535ms)
    ✓ 5. ICO fails, sale investors get full refunds (269ms)


  40 passing (7s)
```
