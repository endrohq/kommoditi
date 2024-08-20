# Kommoditi

This is an official repository for the Kommoditi project. A supply chain protocol where adaptive pricing engines, seamless commodity sourcing and automatic client acquisition reduce costs and increase efficiency through the power of Hedera.

### Requirements

- Node.js 20+

### Apps and Packages

- `web`: The main web app (NextJS)
- `contracts`: Solidity Contracts (Hardhat)

### Build & Run

Important notes: 

1. You need to a privy.io auth key to run the web app. Please refer to the [Privy.io documentation](https://docs.privy.io/) to get your auth key.
2. You need to a Mapbox API key to run the web app. Please refer to the [Mapbox documentation](https://docs.mapbox.com/help/getting-started/access-tokens/) to get your API key.

#### Run the web app with Hedera testnet

When using the testnet, you'll have 2 options:
1. Use metamask with an existing account that holds testnet HBARs
2. Use email sign-in after installment, copy your EVM address found on your profile page, and paste it on the [Hedera faucet](https://portal.hedera.com/faucet) to get testnet HBARs

3. Execute the following commands: 
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
