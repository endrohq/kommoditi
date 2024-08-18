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
		address: "0x65d72E96Ed0e48e08c08b06a3Fd05b2BB1F7e957",
		abi: participantsAbi as Abi,
	},
	commodityExchange: {
		address: "0xaeFf7F3FdcCa9fF29ad4568EFB331A3feaCCa0d9",
		abi: exchangeAbi as Abi,
	},
	tokenAuthority: {
		address: "0xf716DFC4a3eadefD9128607FDE29793642cC5129",
		abi: tokenAuthorityAbi as Abi,
	},
	commodityFactory: {
		address: "0xe9877ff42FBC2c00812ea922Bd58df9377AEB444",
		abi: commodityFactoryAbi as Abi,
	},
	commodityPool: {
		address: "0x",
		abi: commodityPoolAbi as Abi,
	},
};

export const contracts = isLocalNetwork ? localContracts : testnetContracts;
