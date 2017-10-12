//testrpc --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e1c, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e11, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e12, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e13, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e14, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e15, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e16, 1000000000000000000000000" --account="0xf84e9b54634b7a970ea64e11443b466758d33ae7ef3f9066b52457fc27a37e17, 1000000000000000000000000"

const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Minting Team Tokens', function (accounts) {

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
  var team_address_unlocked = accounts[5];
  var team_address_locked = accounts[6];

  it("0. investors purchase some tokens during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to pre-sale day 1
    await gamesToken.setMockedNow(preSaleStartTime + 1);

    //Should not be able to mint team locked tokens now as there is no totalSupply
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1 * TOKENDEC, {from: owner});
    });

    //Should not be able to mint team unlocked tokens now as there is no totalSupply
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1 * TOKENDEC, {from: owner});
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

  it("1. team tokens minted during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Maximum number of tokens that should be mintable for team is 2/5 * 122000 = 48800
    await gamesToken.mintTeamLocked(team_address_locked, 20000 * TOKENDEC, {from: owner});
    await gamesToken.mintTeamUnlocked(team_address_unlocked, 28800 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1 * TOKENDEC, {from: owner});
    });
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(team_address_locked)).toNumber(), 20000 * TOKENDEC, "Balance should be 20000");
    assert.equal((await gamesToken.balanceOf(team_address_unlocked)).toNumber(), 28800 * TOKENDEC, "Balance should be 28800");

  });

  it("2. more tokens bought, more team tokens minted during pre-sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Purchase some tokens - another 30 * 2000 = 60000 tokens
    await gamesToken.sendTransaction({from: investor_1, value: 20 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_2, value: 10 * ONEETHER});

    //Maximum number of tokens that should be mintable for team is 2/5 * 60000 = 24000
    await gamesToken.mintTeamLocked(team_address_locked, 20000 * TOKENDEC, {from: owner});
    await gamesToken.mintTeamUnlocked(team_address_unlocked, 4000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1 * TOKENDEC, {from: owner});
    });
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(team_address_locked)).toNumber(), 40000 * TOKENDEC, "Balance should be 40000");
    assert.equal((await gamesToken.balanceOf(team_address_unlocked)).toNumber(), (28800 + 4000) * TOKENDEC, "Balance should be (28800 + 4000)");

  });

  it("3. more tokens bought sale, more team tokens minted during sale", async () => {

    var gamesToken = await GamesToken.deployed();

    //Go to sale day 1
    await gamesToken.setMockedNow(saleStartTime + 1);

    //Minting anymore should now still fail
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1 * TOKENDEC, {from: owner});
    });
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1 * TOKENDEC, {from: owner});
    });

    //Purchase some more tokens - another 20 * 1250 = 25000 tokens
    await gamesToken.sendTransaction({from: investor_1, value: 10 * ONEETHER});
    await gamesToken.sendTransaction({from: investor_2, value: 10 * ONEETHER});

    //Maximum number of tokens that should be mintable for team is 2/5 * 25000 = 10000
    await gamesToken.mintTeamLocked(team_address_locked, 5000 * TOKENDEC, {from: owner});
    await gamesToken.mintTeamUnlocked(team_address_unlocked, 5000 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1 * TOKENDEC, {from: owner});
    });
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(team_address_locked)).toNumber(), 45000 * TOKENDEC, "Balance should be 45000");
    assert.equal((await gamesToken.balanceOf(team_address_unlocked)).toNumber(), (28800 + 9000) * TOKENDEC, "Balance should be (28800 + 9000)");

  });

  it("4. cap met, more team tokens minted", async () => {

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

    //Maximum number of tokens that should be mintable for team is 2/5 * 104166250 = 41666500
    await gamesToken.mintTeamLocked(team_address_locked, 41666000 * TOKENDEC, {from: owner});
    await gamesToken.mintTeamUnlocked(team_address_unlocked, 250 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintTeamLocked(team_address_locked, 1000 * TOKENDEC, {from: owner});
    });
    await assertFail(async () => {
      await gamesToken.mintTeamUnlocked(team_address_unlocked, 1000 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(team_address_locked)).toNumber(), (41666000 + 45000) * TOKENDEC, "Balance should be (41666000 + 45000)");
    assert.equal((await gamesToken.balanceOf(team_address_unlocked)).toNumber(), (28800 + 9250) * TOKENDEC, "Balance should be (28800 + 9250)");

  });

  it("5. ICO finished, more team tokens minted", async () => {

    var gamesToken = await GamesToken.deployed();

    await gamesToken.setMockedNow(saleStartTime + (4 * ONEDAY) + 1);

    //extra time should now be false
    assert.equal(await gamesToken.isExtraTime.call(), false, "Extra Time Finished");

    //ICO should now have finished
    assert.equal(await gamesToken.isIcoFinished.call(), true, "ICO Finished");

    //Maximum number of tokens that should be mintable is the remaining 250
    await gamesToken.mintTeamLocked(team_address_locked, 100 * TOKENDEC, {from: owner});
    await gamesToken.mintTeamUnlocked(team_address_unlocked, 150 * TOKENDEC, {from: owner});

    //Minting anymore should now fail
    await assertFail(async () => {
      await gamesToken.mintReserve(reserve_address, 1 * TOKENDEC, {from: owner});
    });

    //Check balances and total supply is correct
    assert.equal((await gamesToken.balanceOf(team_address_locked)).toNumber(), (100 + 41666000 + 45000) * TOKENDEC, "Balance should be (100 + 41666000 + 45000)");
    assert.equal((await gamesToken.balanceOf(team_address_unlocked)).toNumber(), (150 + 28800 + 9250) * TOKENDEC, "Balance should be (150 + 28800 + 9250)");

  });
});
