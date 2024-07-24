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

export type Commodity = {
	name: string;
	symbol: string;
	type: string;
};
