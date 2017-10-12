//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Refunds And Withdrawals', function (accounts) {

  var owner = accounts[0];
  var wallet = accounts[1];
  var preSaleStartTime = 1509105600;
  var preSaleEndTime =  1510315200;
  var saleStartTime = 1511438400;
  var saleEndTime = 1514030400;
  var ONEDAY = 24 * 60 * 60;
  var ONEETHER = 1000000000000000000;
  var TOKENDEC = 1000000;
  var investor_1 = accounts[2];
  var investor_2 = accounts[3];
  var investor_3 = accounts[4];
  var investor_4 = accounts[5];

  it("0. purchase in pre-sale first day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 1
    await gamesToken.setMockedNow(preSaleStartTime + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_1, value: ONEETHER});

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_2, value: 5 * ONEETHER});

    //Balance should be 5 * 1250 due to bonus on first two days of sale
    assert.equal((await gamesToken.balanceOf(investor_1)).toNumber(), 1 * 2000 * TOKENDEC, "Balance should be 1 * 1250");
    assert.equal((await gamesToken.balanceOf(investor_2)).toNumber(), 5 * 2000 * TOKENDEC, "Balance should be 5 * 1250");
    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 12000 * TOKENDEC, "Total Supply is 12000");
  });

  it("1. owner withdraws 25% of pre-sale ETH", async () => {

    var gamesToken = await GamesToken.deployed();
    //Total ETH invested is 6 ETH
    var owner_balance_old = await web3.eth.getBalance(owner);
    await gamesToken.ownerWithdraw(1.5 * ONEETHER, {from: owner, gasPrice: 0});
    var owner_balance_new = await web3.eth.getBalance(owner);

    assert.equal(owner_balance_new.sub(owner_balance_old).toNumber(), 1.5 * ONEETHER, "owner withdraws 1.5 ETH");
    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 12000 * TOKENDEC, "Total Supply is 12000");

  });

  it("2. owner changes wallet address, withdraws 25% of pre-sale ETH", async () => {

    var gamesToken = await GamesToken.deployed();
    await gamesToken.setWallet(wallet, {from: owner});

    //Total ETH invested is 6 ETH
    var wallet_balance_old = await web3.eth.getBalance(wallet);
    await gamesToken.ownerWithdraw(1.5 * ONEETHER, {from: owner, gasPrice: 0});
    var wallet_balance_new = await web3.eth.getBalance(wallet);

    assert.equal(wallet_balance_new.sub(wallet_balance_old).toNumber(), 1.5 * ONEETHER, "owner withdraws 1.5 ETH");
    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 12000 * TOKENDEC, "Total Supply is 12000");

  });

  it("3. investors purchase during sale, ether can't be withdrawn", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to sale day 1
    await gamesToken.setMockedNow(saleStartTime + (3 * ONEDAY));

    //Send another 15 ether, 5 from a pre-sale participant
    await gamesToken.sendTransaction({from: investor_1, value: 5 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_3, value: 10 * ONEETHER});

    //Owner can't withdraw any of the 10 sale ETH
    await assertFail(async () => {
      await gamesToken.ownerWithdraw(1 * ONEETHER, {from: owner, gasPrice: 0});
    });
    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 27000 * TOKENDEC, "Total Supply is 27000");

  });

  it("4. ICO fails, pre-sale investors get partial refunds", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.setMockedNow(saleEndTime + 1);

    var investor_1_balance_old = await web3.eth.getBalance(investor_1);
    var investor_2_balance_old = await web3.eth.getBalance(investor_2);

    await gamesToken.reclaimFunds({from: investor_1, gasPrice: 0});
    await gamesToken.reclaimFunds({from: investor_2, gasPrice: 0});

    var investor_1_balance_new = await web3.eth.getBalance(investor_1);
    var investor_2_balance_new = await web3.eth.getBalance(investor_2);

    assert.equal(investor_1_balance_new.sub(investor_1_balance_old).toNumber(), (0.5 + 5) * ONEETHER, "investor_1 refunded 5.5 ETH");
    assert.equal(investor_2_balance_new.sub(investor_2_balance_old).toNumber(), 0.5 * 5 * ONEETHER, "investor_2 refunded 2.5 ETH");

    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 16000 * TOKENDEC, "Total Supply is 16000");

  });

  it("5. ICO fails, sale investors get full refunds", async () => {

    var gamesToken = await GamesToken.deployed();

    var investor_3_balance_old = await web3.eth.getBalance(investor_3);

    await gamesToken.reclaimFunds({from: investor_3, gasPrice: 0});

    var investor_3_balance_new = await web3.eth.getBalance(investor_3);

    assert.equal(investor_3_balance_new.sub(investor_3_balance_old).toNumber(), 10 * ONEETHER, "investor_3 refunded 10 ETH");

    assert.equal((await gamesToken.totalSupply.call()).toNumber(), 6000 * TOKENDEC, "Total Supply is 6000");

  });

});
