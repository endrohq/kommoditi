export type LocationItem = {
	address: string;
	lat: number;
	lng: number;
	h3Index?: string;
};

export type Producer = {
	name: string;
	location: string;
	h3Index?: string;
};

export type EthAddress = `0x${string}`;

export type Account = {
	address: EthAddress;
	balance?: string;
	producer?: Producer;
};

export type CommodityListingApproval = {
	approved: boolean;
	tokenAddress: string;
};

export type CommodityListing = {
	tokenAddress: string;
	quantity: number;
	price: number;
	producer: string;
	deliveryWindow: number;
};

export type HederaToken = {
	totalSymbol: number;
	token: {
		name: string;
		symbol: string;
		treasury: string;
		memo: string;
		tokenSupplyType: boolean;
	};
	totalSupply: number;
	pauseStatus: boolean;
	defaultKycStatus: boolean;
	deleted: boolean;
};

export type GetCommodityResponse = {
	tokenInfo: HederaToken;
	tokenAddress: string;
};

export type CommodityToken = HederaToken & {
	isListed?: boolean;
	tokenAddress: string;
};
