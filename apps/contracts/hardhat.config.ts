import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hederaTestnet: {
      url: "https://testnet.hedera.com:443",
      chainId: 296,
      accounts: [PRIVATE_KEY],
    }
  }
};

export default config;
