# minimal-hardhat-boilerplate

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts with balances.

> Recommended to use Node.js v18+ and npm v8+

Try running some of the following tasks:

```shell
npm install

# Set/Read/Remove hardhat config variables
# npx hardhat vars set API_KEY
# npx hardhat vars get API_KEY
# npx hardhat vars DELETE API_KEY
# npx hardhat vars list

# set PRIVATE_KEY
npx hardhat vars set PRIVATE_KEY


# starts local node
npx hardhat node

# compile contracts
npx hardhat compile

# deploy contract defined in tasks on specified network
npx hardhat deploy --network localhost

# deploy contract in scripts/deploy.ts on specified network
npx hardhat run scripts/deploy.ts --network localhost

# verify contract
npx hardhat verify --network <deployed network> <deployed contract address> "<constructor1>" "<constructor2>"

# check coverage using solidity-coverage plugin: supports hardhat network only
npx hardhat coverage --network hardhat

# unit tests including gas usage
npx hardhat test

# remove all compiled and deployed artifacts
npx hardhat clean

# show help
npx hardhat help
```
