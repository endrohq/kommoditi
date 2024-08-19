import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

import { ContractName } from "@/typings";
import commodityPoolAbi from "./abis/commodity-pool.abi.json";
import exchangeAbi from "./abis/exchange.abi.json";
import commodityFactoryAbi from "./abis/factory.abi.json";
import participantsAbi from "./abis/participants.abi.json";
import tokenAuthorityAbi from "./abis/token-authority.abi.json";

export const appTitle = "Commodity Exchange";
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

const testnetContracts: Record<ContractName, ContractInfo> = {
	participantRegistry: {
		address: "0x423b1D1Ba103A2347c4C6A79579402b3c10CA5fF",
		abi: participantsAbi as Abi,
	},
	commodityExchange: {
		address: "0x3B7d8C3798Ad094BEbCaA231d4d17222Dd961849",
		abi: exchangeAbi as Abi,
	},
	tokenAuthority: {
		address: "0x934bECBC1B7d54ef2A54605092398aFb744B430D",
		abi: tokenAuthorityAbi as Abi,
	},
	commodityFactory: {
		address: "0xc9AaAfB2c77D25EF281918E24B2CfbB22FDA3a7E",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

export const contracts = isLocalNetwork ? localContracts : testnetContracts;
