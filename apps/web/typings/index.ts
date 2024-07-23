export type LocationItem = {
	text: string;
	lat: number;
	lng: number;
	h3Index?: string;
};

export type EthAddress = `0x${string}`;

export type Account = {
	address: EthAddress;
	balance?: string;
	producer?: LocationItem;
};
