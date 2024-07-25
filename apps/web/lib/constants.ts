import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

import exchangeAbi from "./abis/exchange.abi.json";
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
	| "tokenAuthority";
type ContractInfo = {
	address: `0x${string}`;
	abi: Abi;
};

const localContracts: Record<ContractNames, ContractInfo> = {
	producerRegistry: {
		address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
		abi: producersAbi as Abi,
	},
	commodityExchange: {
		address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
		abi: exchangeAbi as Abi,
	},
	tokenAuthority: {
		address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
		abi: tokenAuthorityAbi as Abi,
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
};

export const contracts = isLocal ? localContracts : testnetContracts;
