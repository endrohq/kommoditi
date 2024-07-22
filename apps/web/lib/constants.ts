import { http, createConfig } from "wagmi";
import { hardhat, hederaTestnet } from "wagmi/chains";

const isLocal = process.env.NEXT_PUBLIC_IS_LOCAL === "true";

export const localOnlyOptions = [hardhat];
export const testnetOptions = [hederaTestnet];

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
