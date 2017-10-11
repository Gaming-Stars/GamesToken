//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Make Pre-Sale Purchases', function (accounts) {

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

  it("0. purchase in first day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Can't purchase before pre-sale time
    await assertFail(async () => {
      await gamesToken.sendTransaction({from: investor_1, value: ONEETHER});
    })

    //Go to pre-sale day 1
    await gamesToken.setMockedNow(preSaleStartTime + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_1, value: ONEETHER});

    //Balance should be 2000 due to bonus on first day
    assert.equal((await gamesToken.balanceOf(investor_1)).toNumber(), 2000 * TOKENDEC, "Balance should be 2000");

  });

  it("1. purchase in second day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 2
    await gamesToken.setMockedNow(preSaleStartTime + ONEDAY + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_2, value: ONEETHER});

    //Balance should be 1000 due to bonus on second day
    assert.equal((await gamesToken.balanceOf(investor_2)).toNumber(), 1818 * TOKENDEC, "Balance should be 1818");

  });

  it("2. purchase in third day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 2
    await gamesToken.setMockedNow(preSaleStartTime + (2 * ONEDAY) + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_3, value: ONEETHER});

    //Balance should be 1667 due to bonus on third day
    assert.equal((await gamesToken.balanceOf(investor_3)).toNumber(), 1667 * TOKENDEC, "Balance should be 1667");

  });

  it("3. purchase in fourth day", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 2
    await gamesToken.setMockedNow(preSaleStartTime + (3 * ONEDAY) + 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_4, value: ONEETHER});

    //Balance should be 1538 due to bonus on second day
    assert.equal((await gamesToken.balanceOf(investor_4)).toNumber(), 1538 * TOKENDEC, "Balance should be 1538");

    //Go forward a few more days, rate should remain the same for the rest of the pre-sale
    await gamesToken.setMockedNow(1510315200 - 1);

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_4, value: 2 * ONEETHER});

    //Balance should be 3 * 1538 due to bonus on fourth day
    assert.equal((await gamesToken.balanceOf(investor_4)).toNumber(), 3 * 1538 * TOKENDEC, "Balance should be 3 * 1538");

  });

  it("4. unable to purchase under minimum cap", async () => {

    var gamesToken = await GamesToken.deployed();

    //Can't purchase under minimum contribtion
    await assertFail(async () => {
      await gamesToken.sendTransaction({from: investor_1, value: 1});
    })

  });

  it("5. unable to breach max pre-sale cap", async () => {

    var gamesToken = await GamesToken.deployed();

    //Can't purchase over pre-sale cap
    await assertFail(async () => {
      await gamesToken.sendTransaction({from: investor_1, value: 3333 * ONEETHER});
    })

  });

});
