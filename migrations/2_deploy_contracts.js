//NB - change to GamesToken for real deployment
var GamesToken = artifacts.require("./GamesTokenMock.sol");

module.exports = function(deployer) {
  deployer.deploy(GamesToken);
};
