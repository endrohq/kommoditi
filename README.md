# Turborepo starter

This is an official starter Turborepo.

### Requirements

- Node.js 20+
- Privy.io Auth Key 

### Apps and Packages

- `web`: The main web app (NextJS)
- `contracts`: Solidity Contracts (Hardhat)

### Build & Run

Important note: You need to a privy.io auth key to run the web app. Please refer to the [Privy.io documentation](https://docs.privy.io/) to get your auth key.

There are 2 paths to build and run the apps:

#### Run the web app with Hedera testnet

When using the testnet, you'll have 2 options:
1. Use metamask with an existing account that holds testnet HBARs
2. Use email sign-in after installment, copy your EVM address found on your profile page, and paste it on the [Hedera faucet](https://portal.hedera.com/faucet) to get testnet HBARs

3. Execute the following commands: 
```bash
cd hello-future-app/apps/web
mv .env.example .env (& remove NEXT_PUBLIC_IS_LOCAL=true)
npm install
npm run dev
```


#### Run the web app with local contracts

1. Setup local network 
In order to run the contracts locally, you need to have a local hardhat network running. The following set of commands will start a local network and deploy the contracts. If there are any issues, please refer to the [Hardhat documentation](https://hardhat.org/getting-started/).

```bash
cd hello-future-app/apps/contracts
npm install
npm run node
npm run deploy:local
```

2. With a local network running, you can now run the web app:
Execute the following commands in the root folder

```bash
cd hello-future-app/apps/web
mv .env.example .env
npm install
npm run dev
```

Compile the contracts:

```bash
cd hello-future-app/apps/web
npm install
```
