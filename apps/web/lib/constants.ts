import { Abi } from "viem";
import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

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

type ContractNames = "producerRegistry";
type ContractInfo = {
	address: `0x${string}`;
	abi: Abi;
};

const localContracts: Record<ContractNames, ContractInfo> = {
	producerRegistry: {
		address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
		abi: [
			{
				anonymous: false,
				inputs: [
					{
						indexed: true,
						internalType: "address",
						name: "producerAddress",
						type: "address",
					},
					{
						indexed: false,
						internalType: "string",
						name: "name",
						type: "string",
					},
					{
						indexed: false,
						internalType: "string",
						name: "location",
						type: "string",
					},
					{
						indexed: false,
						internalType: "string",
						name: "h3Index",
						type: "string",
					},
				],
				name: "ProducerRegistered",
				type: "event",
			},
			{
				inputs: [
					{
						internalType: "address",
						name: "_producerAddress",
						type: "address",
					},
				],
				name: "getProducer",
				outputs: [
					{
						components: [
							{
								internalType: "string",
								name: "name",
								type: "string",
							},
							{
								internalType: "string",
								name: "location",
								type: "string",
							},
							{
								internalType: "string",
								name: "h3Index",
								type: "string",
							},
						],
						internalType: "struct ProducerRegistry.Producer",
						name: "",
						type: "tuple",
					},
				],
				stateMutability: "view",
				type: "function",
			},
			{
				inputs: [
					{
						internalType: "address",
						name: "",
						type: "address",
					},
				],
				name: "producers",
				outputs: [
					{
						internalType: "string",
						name: "name",
						type: "string",
					},
					{
						internalType: "string",
						name: "location",
						type: "string",
					},
					{
						internalType: "string",
						name: "h3Index",
						type: "string",
					},
				],
				stateMutability: "view",
				type: "function",
			},
			{
				inputs: [
					{
						internalType: "string",
						name: "_name",
						type: "string",
					},
					{
						internalType: "string",
						name: "_location",
						type: "string",
					},
					{
						internalType: "string",
						name: "_h3Index",
						type: "string",
					},
				],
				name: "registerProducer",
				outputs: [],
				stateMutability: "nonpayable",
				type: "function",
			},
		],
	},
};

const testnetContracts: Record<ContractNames, ContractInfo> = {
	producerRegistry: {
		address: "0x",
		abi: [],
	},
};

export const contracts = isLocal ? localContracts : testnetContracts;
