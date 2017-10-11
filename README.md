# GamesToken

See http://www.gaming-stars.net

## Truffle Environment

These contracts use the Truffle build environment.

### Requirements

1. This repo uses truffle, npm and testrpc:  
https://nodejs.org/en/ (v8.4.0)  
http://truffle.readthedocs.io/en/beta/getting_started/installation/
https://github.com/ethereumjs/testrpc

1. Run `npm install` in the repo root directory.

1. Run `npm install -g truffle`

1. Run `npm install -g ethereumjs-testrpc`.

1. Run testrpc:  
`testrpc`

## Testing

There are test cases using the Truffle framework.

Execute `truffle test`:
```
Using network 'development'.

Compiling ./contracts/GamesToken.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/mock/GamesTokenMock.sol...


  Contract: Check Initialisation
    ✓ 0. check initialized token (61ms)


  1 passing (85ms)
```

## Deployment

1. Execute `truffle compile`:  
```
Compiling ./contracts/GamesToken.sol...
Compiling ./contracts/Migrations.sol...
Compiling ./contracts/mock/GamesTokenMock.sol...
Writing artifacts to ./build/contracts
```

2. Execute `truffle migrate --reset`:  
```
Using network 'development'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0x84ab40c3c98e5f8ebce6fafa98cd034254bf22269e4a5a17e22d43a0071c224f
  Migrations: 0xffae962d42629026f9a7cb31423e89c92001d50a
Saving successful migration to network...
  ... 0x240a9b884c063c1add2433ac8f96cf4cdbf253ea3ee82af364428bf1ec860148
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying GamesTokenMock...
  ... 0x003261a3fd79b2b061806f295771949b799029a3ecc81ee14bb628d89e62350c
  GamesTokenMock: 0x32656eb70ebd6781c8acd577ce4ca89ad45709be
Saving successful migration to network...
  ... 0x56f64c0f91df97064cd49983ab7e8f45a95d6ba881aedae309c6e5633479ea1a
Saving artifacts...
```
