import {
	AccountAllowanceApproveTransaction,
	AccountId,
	AccountInfoQuery,
	Client,
	EthereumTransactionData,
	Hbar,
	NftId,
	PrivateKey,
	TokenAssociateTransaction,
	TokenId,
	TokenMintTransaction,
	TransactionId,
	TransactionRecordQuery,
	TransferTransaction,
} from "@hashgraph/sdk";

const BATCH_SIZE = 10;

const adminPrivateKey = process.env.ADMIN_ONE_PK!;
const adminAccountId = process.env.ADMIN_ONE_ACCOUNT!;

export async function convertEthAddressToAccountId(
	client: Client,
	ethAddress: string,
): Promise<AccountId | null> {
	// Remove '0x' prefix if present
	const address = ethAddress.startsWith("0x")
		? ethAddress.slice(2)
		: ethAddress;

	// Create an AccountId from the EVM address
	const evmAccountId = AccountId.fromEvmAddress(0, 0, address);

	try {
		// Try to get account info for this AccountId
		const accountInfo = await new AccountInfoQuery()
			.setAccountId(evmAccountId)
			.execute(client);

		// If we get here, the account exists
		return accountInfo.accountId;
	} catch (error) {
		console.error("Error fetching account info:", error);
		// Account doesn't exist or there was an error
		return null;
	}
}

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

export async function mintNFTs(
	client: Client,
	tokenId: TokenId,
	adminPrivKey: PrivateKey,
	quantity: number,
): Promise<number[]> {
	let allSerialNumbers: number[] = [];
	let remainingQuantity = quantity;

	while (remainingQuantity > 0) {
		const batchSize = Math.min(remainingQuantity, BATCH_SIZE);
		console.log(`Minting batch of ${batchSize} NFTs...`);
		const batchSerialNumbers = await mintBatch(
			client,
			tokenId,
			adminPrivKey,
			batchSize,
		);
		allSerialNumbers = allSerialNumbers.concat(batchSerialNumbers);
		remainingQuantity -= batchSize;
		console.log(`Minted ${batchSerialNumbers.length} NFTs in this batch.`);
	}

	console.log(`Total minted NFTs: ${allSerialNumbers.length}`);
	console.log(`Minted serial numbers: ${allSerialNumbers.join(", ")}`);

	return allSerialNumbers;
}

async function mintBatch(
	client: Client,
	tokenId: TokenId,
	adminPrivKey: PrivateKey,
	batchSize: number,
): Promise<number[]> {
	const metadataArray = Array(batchSize)
		.fill(0)
		.map((_, index) => Buffer.from(`Metadata for NFT ${index + 1}`));

	const mintTx = new TokenMintTransaction()
		.setTokenId(tokenId)
		.setMetadata(metadataArray)
		.setMaxTransactionFee(new Hbar(20));

	const signedTx = await mintTx.freezeWith(client).sign(adminPrivKey);
	const mintTxResponse = await signedTx.execute(client);
	const record = await new TransactionRecordQuery()
		.setTransactionId(mintTxResponse.transactionId)
		.execute(client);

	if (record.receipt.status.toString() !== "SUCCESS") {
		throw new Error(`Minting failed with status: ${record.receipt.status}`);
	}

	return record.receipt.serials.map((serial) => serial.toNumber());
}

export async function associateToken(
	client: Client,
	tokenId: TokenId,
	accountId: AccountId,
	privateKey: PrivateKey,
): Promise<void> {
	const transaction = new TokenAssociateTransaction()
		.setAccountId(accountId)
		.setTokenIds([tokenId])
		.freezeWith(client);

	const signTx = await transaction.sign(privateKey);
	const txResponse = await signTx.execute(client);
	const receipt = await txResponse.getReceipt(client);

	console.log(
		`Token association with account ${accountId.toString()}: ${receipt.status}`,
	);
}

export async function transferNFTs(
	client: Client,
	tokenId: TokenId,
	fromAccountId: AccountId,
	toAccountId: AccountId,
	serialNumbers: number[],
	adminPrivKey: PrivateKey,
): Promise<void> {
	const transaction = new TransferTransaction();

	serialNumbers.forEach((serialNumber) => {
		transaction.addNftTransfer(
			tokenId,
			serialNumber,
			fromAccountId,
			toAccountId,
		);
	});

	const signedTx = await transaction.freezeWith(client).sign(adminPrivKey);
	const txResponse = await signedTx.execute(client);
	const receipt = await txResponse.getReceipt(client);

	if (receipt.status.toString() !== "SUCCESS") {
		throw new Error(`NFT transfer failed with status: ${receipt.status}`);
	}

	console.log(
		`Successfully transferred ${serialNumbers.length} NFTs from ${fromAccountId.toString()} to ${toAccountId.toString()}`,
	);
}

export async function setAllowanceForAdmin(
	client: Client,
	tokenId: TokenId,
	ownerAccountId: AccountId,
	adminAccountId: AccountId,
	serialNumbers: number[],
): Promise<void> {
	const transaction = new AccountAllowanceApproveTransaction();

	serialNumbers.forEach((serialNumber) => {
		const nftId = new NftId(tokenId, serialNumber);
		transaction.approveTokenNftAllowance(nftId, ownerAccountId, adminAccountId);
	});

	// Sign with the owner's private key
	const ownerPrivateKey = PrivateKey.fromString(process.env.OWNER_PRIVATE_KEY!);
	const signedTx = await transaction.freezeWith(client).sign(ownerPrivateKey);

	const txResponse = await signedTx.execute(client);
	const receipt = await txResponse.getReceipt(client);

	if (receipt.status.toString() !== "SUCCESS") {
		throw new Error(`Allowance setting failed with status: ${receipt.status}`);
	}

	console.log(
		`Allowance set for admin to transfer NFTs from ${ownerAccountId.toString()}`,
	);
}

// ... (keep other existing functions)

export async function transferNFTsAsAdmin(
	client: Client,
	tokenId: TokenId,
	fromAccount: AccountId,
	toAccount: AccountId,
	serialNumbers: number[],
	adminPrivKey: PrivateKey,
): Promise<void> {
	for (let i = 0; i < serialNumbers.length; i += BATCH_SIZE) {
		const batchSerialNumbers = serialNumbers.slice(i, i + BATCH_SIZE);

		console.log(
			`Transferring batch of ${batchSerialNumbers.length} NFTs as admin...`,
		);

		const transaction = new TransferTransaction().setMaxTransactionFee(
			new Hbar(20),
		);

		batchSerialNumbers.forEach((serialNumber) => {
			transaction.addApprovedNftTransfer(
				tokenId,
				serialNumber,
				fromAccount,
				toAccount,
			);
		});

		const signTx = await transaction.freezeWith(client).sign(adminPrivKey);
		const txResponse = await signTx.execute(client);
		const receipt = await txResponse.getReceipt(client);

		if (receipt.status.toString() !== "SUCCESS") {
			throw new Error(
				`NFT transfer as admin failed with status: ${receipt.status}`,
			);
		}

		console.log(
			`Transferred ${batchSerialNumbers.length} NFTs from ${fromAccount.toString()} to ${toAccount.toString()} as admin`,
		);
	}

	console.log(`All NFTs transferred successfully as admin`);
}

export function parseEthAddressToHederaAccountId(ethAddress: string): string {
	// Convert the Ethereum address to a Hedera AccountId
	const hederaAccountId = TransactionId.fromBytes(
		Buffer.from(ethAddress, "hex"),
	);

	// Return the Hedera AccountId as a string
	return hederaAccountId.toString();
}
