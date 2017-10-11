const GamesToken = artifacts.require("./GamesTokenMock.sol");

const assertFail = require("./helpers/assertFail");

contract('Check Initialisation', function (accounts) {

  // =========================================================================
  it("0. check initialized token", async () => {

    //First we setup a FiinuToken and FiinuCrowdSale
    var gamesToken = await GamesToken.deployed();

    var tokenOwner = await gamesToken.owner();
    assert.equal(tokenOwner, accounts[0], "owner is set correctly");

    var totalSupply = await gamesToken.totalSupply();
    assert.equal(totalSupply.toNumber(), 0, "Initial totalSupply should be 0");

  });

});
