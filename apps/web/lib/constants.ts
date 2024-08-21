import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

import { ContractName } from "@/typings";
import commodityPoolAbi from "./abis/commodity-pool.abi.json";
import exchangeAbi from "./abis/exchange.abi.json";
import commodityFactoryAbi from "./abis/factory.abi.json";
import participantsAbi from "./abis/participants.abi.json";

export const appTitle = "Kommoditi";
export const baseCommodityUnit = "KG";

export const isLocalNetwork = process.env.NEXT_PUBLIC_IS_LOCAL === "true";

export const networkId = isLocalNetwork ? hardhat.id : hederaTestnet.id;

const localOnlyOptions = [hardhat];
const testnetOptions = [hederaTestnet];

const testnetOnlyConfig = createConfig({
	chains: [hederaTestnet],
	transports: {
		[hederaTestnet.id]: http(),
	},
});

const localOnlyConfig = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
});

export const optionConfig = isLocalNetwork ? localOnlyOptions : testnetOptions;
export const chainOptions = isLocalNetwork
	? localOnlyConfig
	: testnetOnlyConfig;

type ContractInfo = {
	address: `0x${string}`;
	abi: Abi;
};

const localContracts: Record<ContractName, ContractInfo> = {
	participantRegistry: {
		address: "0x1a34E19cF6373A64dfcFc8e558148054894bC86B",
		abi: participantsAbi as Abi,
	},
	commodityExchange: {
		address: "0xf7182c117c9D43397921D22F9B2D75D73E359391",
		abi: exchangeAbi as Abi,
	},
	commodityFactory: {
		address: "0x08c35ae9BD5ED9D6967183D712ec1C0D0dDdc23B",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

const testnetContracts: Record<ContractName, ContractInfo> = {
	participantRegistry: {
		address: "0x4be714E4FE4ae6DfFd169C51aF243faC89d26856",
		abi: participantsAbi as Abi,
	},
	commodityExchange: {
		address: "0xDdC57688f00D4372cdA1898C540caa8F0890080c",
		abi: exchangeAbi as Abi,
	},
	commodityFactory: {
		address: "0x4AFF78290E840D621688b549b17E47fc800fFEf8",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

export const contracts = isLocalNetwork ? localContracts : testnetContracts;
