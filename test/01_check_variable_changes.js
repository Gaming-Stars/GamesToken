const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Variable Changes', function (accounts) {

  var owner = accounts[0];
  var preSaleStartTime = 1509105600;
  var preSaleEndTime =  1510315200;
  var saleStartTime = 1511438400;
  var saleEndTime = 1514030400;
  var ONEETHER = 1000000000000000000;

  // =========================================================================
  it("0. change wallet address", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.setWallet(accounts[1], {from: owner});

    assert.equal(await gamesToken.wallet.call(), accounts[1], "Wallet should be updated");

  });

  it("1. change start ico time", async () => {

    var gamesToken = await GamesToken.deployed();
    await gamesToken.setMockedNow(1509105600 - 24*60*60); //One day before current ico start time

    //Can't set ICO start before now
    await assertFail(async () => {
      await gamesToken.updateDateIcoStart(1, {from: owner});
    })

    //Can't set start time after end time
    await assertFail(async () => {
      await gamesToken.updateDateIcoStart(saleEndTime + 1, {from: owner});
    })

    await gamesToken.updateDateIcoStart(preSaleEndTime + 1, {from: owner});
    assert.equal(await gamesToken.dateIcoStart.call(), preSaleEndTime + 1, "Start date should be updated");

    //Set it back to default value
    await gamesToken.updateDateIcoStart(saleStartTime, {from: owner});

  });

  it("1. change end ico time", async () => {

    var gamesToken = await GamesToken.deployed();
    await gamesToken.setMockedNow(1509105600 - 24*60*60); //One day before current ico start time

    //Can't set ICO start before now
    await assertFail(async () => {
      await gamesToken.updateDateIcoEnd(1, {from: owner});
    })

    //Can't set start time after end time
    await assertFail(async () => {
      await gamesToken.updateDateIcoEnd(saleStartTime - 1, {from: owner});
    })

    await gamesToken.updateDateIcoEnd(saleStartTime + 1, {from: owner});
    assert.equal(await gamesToken.dateIcoEnd.call(), saleStartTime + 1, "End date should be updated");

    //Set it back to default value
    await gamesToken.updateDateIcoEnd(saleEndTime, {from: owner});

  });

  it("2. change funding cap", async () => {

    var gamesToken = await GamesToken.deployed();
    await gamesToken.setMockedNow(1509105600 - 24*60*60); //One day before current ico start time

    //Can't set cap to 1 ether (too low)
    await assertFail(async () => {
      await gamesToken.updateFundingCapIco(ONEETHER, {from: owner});
    })

    //Can't set cap to 10000000 ether (too high)
    await assertFail(async () => {
      await gamesToken.updateFundingCapIco(10000000 * ONEETHER, {from: owner});
    })

    await gamesToken.updateFundingCapIco(100000 * ONEETHER, {from: owner});
    assert.equal(await gamesToken.fundingCapICO.call(), 100000 * ONEETHER, "Funding cap should be updated");

    //Set it back to default value
    await gamesToken.updateFundingCapIco(83333 * ONEETHER, {from: owner});

  });

});
