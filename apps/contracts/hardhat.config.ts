import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import {adminAccount, localAccounts} from "./ignition/data";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      chainId: 296,
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
