//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Make Sale Purchases', function (accounts) {

  var owner = accounts[0];
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

  it("0. purchase in sale first two days", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 1
    await gamesToken.setMockedNow(preSaleStartTime + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_1, value: ONEETHER});

    //Go to sale day 1
    await gamesToken.setMockedNow(saleStartTime + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_2, value: 5 * ONEETHER});

    //Balance should be 5 * 1250 due to bonus on first two days of sale
    assert.equal((await gamesToken.balanceOf(investor_1)).toNumber(), 1 * 2000 * TOKENDEC, "Balance should be 1 * 1250");
    assert.equal((await gamesToken.balanceOf(investor_2)).toNumber(), 5 * 1250 * TOKENDEC, "Balance should be 5 * 1250");

  });

  it("1. purchase in second day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 2
    await gamesToken.setMockedNow(saleStartTime + (2 * ONEDAY) + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_3, value: ONEETHER});

    //Purchase some more tokens
    await gamesToken.sendTransaction({from: investor_3, value: 2 * ONEETHER});

    //Balance should be 3 * 1000 due to bonus on second day
    assert.equal((await gamesToken.balanceOf(investor_3)).toNumber(), 3 * 1000 * TOKENDEC, "Balance should be 3000");

  });


  it("2. unable to purchase under minimum cap", async () => {

    var gamesToken = await GamesToken.deployed();

    //Can't purchase under minimum contribtion
    await assertFail(async () => {
      await gamesToken.sendTransaction({from: investor_1, value: 1});
    });

  });

  it("3. reach max sale cap", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.sendTransaction({from: investor_1, value: 83333 * ONEETHER});

    //softCapReached should now be true
    assert.equal(await gamesToken.softCapReached.call(), true, "Soft Cap Reached");

    //extra time should now be true
    assert.equal(await gamesToken.isExtraTime.call(), true, "Extra Time Started");

    //ICO should not have finished
    assert.equal(await gamesToken.isIcoFinished.call(), false, "ICO Finished");

  });

  it("4. able to make purchase during extra time", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.sendTransaction({from: investor_2, value: 1000 * ONEETHER});

  });

  it("5. unable to make purchases after extra time finishes", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.setMockedNow(saleStartTime + (4 * ONEDAY) + 1);

    //extra time should now be false
    assert.equal(await gamesToken.isExtraTime.call(), false, "Extra Time Finished");

    //ICO should now have finished
    assert.equal(await gamesToken.isIcoFinished.call(), true, "ICO Finished");

    //Should not be able to purchase now
    await assertFail(async () => {
      await gamesToken.sendTransaction({from: investor_3, value: 1 * ONEETHER});
    });

  });

  it("6. check can transfer tokens", async () => {

    var gamesToken = await GamesToken.deployed();

    //Should not be able to transfer
    await assertFail(async () => {
      await gamesToken.transfer(investor_2, 10 * TOKENDEC, {from: investor_1});
    });

    await gamesToken.makeTradeable({from: owner});

    await gamesToken.transfer(investor_2, 10 * TOKENDEC, {from: investor_1});

    //Check balances have updated
    assert.equal((await gamesToken.balanceOf(investor_1)).toNumber(), (83335000 - 10) * TOKENDEC, "Balance should be (83335000 - 10)");
    assert.equal((await gamesToken.balanceOf(investor_2)).toNumber(), ((1000 * 1000) + ((5 * 1250) + 10)) * TOKENDEC, "Balance should be ((1000 * 1000) + ((5 * 1250) + 10))");

  });
});
