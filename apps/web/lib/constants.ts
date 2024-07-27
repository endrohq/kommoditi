import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

import commodityPoolAbi from "./abis/commodity-pool.abi.json";
import exchangeAbi from "./abis/exchange.abi.json";
import commodityFactoryAbi from "./abis/factory.abi.json";
import producersAbi from "./abis/producers.abi.json";
import tokenAuthorityAbi from "./abis/token-authority.abi.json";

const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";

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

export const optionConfig = isLocal ? localOnlyOptions : testnetOptions;
export const chainOptions = isLocal ? localOnlyConfig : testnetOnlyConfig;

type ContractNames =
	| "producerRegistry"
	| "commodityExchange"
	| "tokenAuthority"
	| "commodityFactory"
	| "commodityPool";

type ContractInfo = {
	address: `0x${string}`;
	abi: Abi;
};

const localContracts: Record<ContractNames, ContractInfo> = {
	producerRegistry: {
		address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		abi: producersAbi as Abi,
	},
	commodityExchange: {
		address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
		abi: exchangeAbi as Abi,
	},
	tokenAuthority: {
		address: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
		abi: tokenAuthorityAbi as Abi,
	},
	commodityFactory: {
		address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

const testnetContracts: Record<ContractNames, ContractInfo> = {
	producerRegistry: {
		address: "0x",
		abi: [],
	},
	commodityExchange: {
		address: "0x",
		abi: [],
	},
	tokenAuthority: {
		address: "0x",
		abi: [],
	},
	commodityFactory: {
		address: "0x",
		abi: [],
	},
	commodityPool: {
		address: "0x",
		abi: [],
	},
};

export const contracts = isLocal ? localContracts : testnetContracts;
