import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const adminAccount = process.env.ADMIN_ONE_PK!, localAccounts: any[] = [];

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
      timeout: 120000, // 2 minutes in milliseconds
      accounts: [adminAccount],
    },
    hardhat: {
      accounts: localAccounts?.map((account) => ({
        privateKey: `0x${account}`,
        balance: "1000000000000000000000000",
      })),
    }
  }
};

export default config;
