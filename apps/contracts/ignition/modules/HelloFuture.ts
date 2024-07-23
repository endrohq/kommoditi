import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModule", (m) => {
  const ProducerRegistry = m.contract("ProducerRegistry");

  let CommodityExchange;

  // Use the real Hedera Token Service address for testnet/mainnet
  const hederaTokenServiceAddress = "0x0000000000000000000000000000000000000167";
  const tokenService = m.contractAt("IHederaTokenService", hederaTokenServiceAddress);
  CommodityExchange = m.contract("CommodityExchangeV0", [tokenService]);

  return {
    CommodityExchange,
    ProducerRegistry
  }
});

export default HelloFutureModule;
