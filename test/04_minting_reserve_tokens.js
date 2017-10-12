//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Minting Reserve Tokens', function (accounts) {

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
  var reserve_address = accounts[6];

  it("0. investors purchase some tokens during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 1
    await gamesToken.setMockedNow(preSaleStartTime + 1);

    //Should not be able to mint reserve or team tokens now as there is no totalSupply
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Purchase some tokens
    await gamesToken.sendTransaction({from: investor_1, value: ONEETHER});
    await gamesToken.sendTransaction({from: investor_2, value: 10 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_3, value: 50 * ONEETHER});

    //Total Supply should be 61 * 2000 = 122000
    assert.equal((await gamesToken.totalSupply()).toNumber(), 122000 * TOKENDEC, "Balance should be 122000");

    //tokensIssuedCrowd should also be 61 * 2000 = 122000
    assert.equal((await gamesToken.tokensIssuedCrowd.call()).toNumber(), 122000 * TOKENDEC, "Balance should be 122000");

  });

  it("1. reserve tokens minted during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Non owner can't mint
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: investor_1});
    });

    //Maximum number of tokens that should be mintable for reserve is 3/5 * 122000 = 73200
    await gamesToken.mintReserve(reserve_address, 23200 * TOKENDEC, {from: owner});
    await gamesToken.mintReserve(reserve_address, 50000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(reserve_address)).toNumber(), 73200 * TOKENDEC, "Balance should be 73200");

  });

  it("2. more tokens bought, more reserve tokens minted during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Purchase some tokens - another 30 * 2000 = 60000 tokens
    await gamesToken.sendTransaction({from: investor_1, value: 20 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_2, value: 10 * ONEETHER});

    //Maximum number of tokens that should be mintable for reserve is 3/5 * 60000 = 36000
    await gamesToken.mintReserve(reserve_address, 30000 * TOKENDEC, {from: owner});
    await gamesToken.mintReserve(reserve_address, 6000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(reserve_address)).toNumber(), 109200 * TOKENDEC, "Balance should be 109200");

  });

  it("3. more tokens bought sale, more reserve tokens minted during sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to sale day 1
    await gamesToken.setMockedNow(saleStartTime + 1);

    //Minting anymore should now still fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Purchase some more tokens - another 20 * 1250 = 25000 tokens
    await gamesToken.sendTransaction({from: investor_1, value: 10 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_2, value: 10 * ONEETHER});

    //Maximum number of tokens that should be mintable for reserve is 3/5 * 25000 = 15000
    await gamesToken.mintReserve(reserve_address, 10000 * TOKENDEC, {from: owner});
    await gamesToken.mintReserve(reserve_address, 5000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(reserve_address)).toNumber(), 124200 * TOKENDEC, "Balance should be 124200");

  });

  it("4. cap met, more reserve tokens minted", async () => {

    var gamesToken = await GamesToken.deployed();

    //Meet cap
    //Purchase some more tokens - another 83333 * 1250 = 104166250 tokens
    await gamesToken.sendTransaction({from: investor_1, value: 83333 * ONEETHER});

    //softCapReached should now be true
    assert.equal(await gamesToken.softCapReached.call(), true, "Soft Cap Reached");

    //extra time should now be true
    assert.equal(await gamesToken.isExtraTime.call(), true, "Extra Time Started");

    //ICO should not have finished
    assert.equal(await gamesToken.isIcoFinished.call(), false, "ICO Finished");

    //Maximum number of tokens that should be mintable for reserve is 3/5 * 104166250 = 62499750
    await gamesToken.mintReserve(reserve_address, 62499000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1000 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(reserve_address)).toNumber(), (62499000 + 124200) * TOKENDEC, "Balance should be (62499000 + 124200)");

  });

  it("5. ICO finished, more reserve tokens minted", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.setMockedNow(saleStartTime + (4 * ONEDAY) + 1);

    //extra time should now be false
    assert.equal(await gamesToken.isExtraTime.call(), false, "Extra Time Finished");

    //ICO should now have finished
    assert.equal(await gamesToken.isIcoFinished.call(), true, "ICO Finished");

    //Reserve allocation of 750 left from above
    await gamesToken.mintReserve(reserve_address, 750 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(reserve_address)).toNumber(), (62499750 + 124200) * TOKENDEC, "Balance should be (62499750 + 124200)");

  });
});
