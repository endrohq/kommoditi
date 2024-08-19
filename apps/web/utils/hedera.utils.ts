"use server";

import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";

const adminPrivateKey = process.env.ADMIN_ONE_PK!;
const adminAccountId = process.env.ADMIN_ONE_ACCOUNT!;

export async function getHederaAdminAccount() {
	const adminAccount = AccountId.fromString(adminAccountId);
	const adminPrivKey = PrivateKey.fromStringDer(adminPrivateKey);
	return { adminAccount, adminPrivKey };
}

export async function getHederaClient() {
	const client = Client.forTestnet();
	const adminAccount = AccountId.fromString(adminAccountId);
	const adminPrivKey = PrivateKey.fromStringDer(adminPrivateKey);

	client.setOperator(adminAccount, adminPrivKey);
	return client;
}
