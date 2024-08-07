import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

import commodityPoolAbi from "./abis/commodity-pool.abi.json";
import exchangeAbi from "./abis/exchange.abi.json";
import commodityFactoryAbi from "./abis/factory.abi.json";
import participantsAbi from "./abis/participants.abi.json";
import tokenAuthorityAbi from "./abis/token-authority.abi.json";

export const isLocalNetwork = process.env.NEXT_PUBLIC_IS_LOCAL === "true";

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

type ContractNames =
	| "participantRegistry"
	| "commodityExchange"
	| "tokenAuthority"
	| "commodityFactory"
	| "commodityPool";

type ContractInfo = {
	address: `0x${string}`;
	abi: Abi;
};

const localContracts: Record<ContractNames, ContractInfo> = {
	participantRegistry: {
		address: "0xc5BE7797465EEe63523c4674F347730A9D0472A4",
		abi: participantsAbi as Abi,
	},
	commodityExchange: {
		address: "0xa72429A4e6b56E7ec0BD505de6635e54011Bc98d",
		abi: exchangeAbi as Abi,
	},
	tokenAuthority: {
		address: "0x8F9A6c5F2f41F0f71E28B21ae32C26C6B0330702",
		abi: tokenAuthorityAbi as Abi,
	},
	commodityFactory: {
		address: "0x5e06fC9925536348d0c2184Da3e628A079409Cc3",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

const testnetContracts: Record<ContractNames, ContractInfo> = {
	participantRegistry: {
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

export const contracts = isLocalNetwork ? localContracts : testnetContracts;
