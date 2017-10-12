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
    ✓ 0. check initialized token (80ms)

  Contract: Check Variable Changes
    ✓ 0. change wallet address (79ms)
    ✓ 1. change start ico time (144ms)
    ✓ 1. change end ico time (162ms)
    ✓ 2. change funding cap (176ms)

  Contract: Make Pre-Sale Purchases
    ✓ 0. purchase in first day (114ms)
    ✓ 1. purchase in second day (108ms)
    ✓ 2. purchase in third day (100ms)
    ✓ 3. purchase in fourth day (178ms)
    ✓ 4. unable to purchase under minimum cap
    ✓ 5. unable to breach max pre-sale cap

  Contract: Make Sale Purchases
    ✓ 0. purchase in sale first two days (159ms)
    ✓ 1. purchase in second day (126ms)
    ✓ 2. unable to purchase under minimum cap
    ✓ 3. reach max sale cap (172ms)
    ✓ 4. able to make purchase during extra time (55ms)
    ✓ 5. unable to make purchases after extra time finishes (115ms)
    ✓ 6. check can transfer tokens (128ms)

  Contract: Minting Reserve Tokens
    ✓ 0. investors purchase some tokens during pre-sale (193ms)
    ✓ 1. reserve tokens minted during pre-sale (114ms)
    ✓ 2. more tokens bought, more reserve tokens minted during pre-sale (189ms)
    ✓ 3. more tokens bought sale, more reserve tokens minted during sale (232ms)
    ✓ 4. cap met, more reserve tokens minted (228ms)
    ✓ 5. ICO finished, more reserve tokens minted (181ms)
    ✓ 6. check can transfer reserve tokens (119ms)

  Contract: Minting Team Tokens
    ✓ 0. investors purchase some tokens during pre-sale (274ms)
    ✓ 1. team tokens minted during pre-sale (152ms)
    ✓ 2. more tokens bought, more team tokens minted during pre-sale (220ms)
    ✓ 3. more tokens bought sale, more team tokens minted during sale (253ms)
    ✓ 4. cap met, more team tokens minted (289ms)
    ✓ 5. ICO finished, more team tokens minted (253ms)
    ✓ 6. check can transfer team unlocked tokens (136ms)
    ✓ 7. check can not transfer team locked tokens
    ✓ 8. check can transfer team locked tokens after lock up period (186ms)

  Contract: Check Refunds And Withdrawals
    ✓ 0. purchase in pre-sale first day (177ms)
    ✓ 1. owner withdraws 25% of pre-sale ETH (294ms)
    ✓ 2. owner changes wallet address, withdraws 25% of pre-sale ETH (276ms)
    ✓ 3. investors purchase during sale, ether can't be withdrawn (155ms)
    ✓ 4. ICO fails, pre-sale investors get partial refunds (535ms)
    ✓ 5. ICO fails, sale investors get full refunds (269ms)


  40 passing (7s)
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
