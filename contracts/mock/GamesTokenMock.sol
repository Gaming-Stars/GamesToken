pragma solidity ^0.4.15;

import '../GamesToken.sol';

contract GamesTokenMock is GamesToken {

  event MockNow(uint _now);

  uint public mock_now = 1;

  function GamesTokenMock() {}

  function atNow() constant returns (uint) {
      return mock_now;
  }

  function setMockedNow(uint _b) public {
      mock_now = _b;
      MockNow(_b);
  }

}
