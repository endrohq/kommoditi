
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleHederaTestnet", (m) => {
  const ProducerRegistry = m.contract("ProducerRegistry");

  const HederaTokenServiceAddress = m.contractAt("IHederaTokenService", "0x0000000000000000000000000000000000000167");const CommodityExchange = m.contract("CommodityExchange", [HederaTokenServiceAddress], {
    after: [HederaTokenServiceAddress]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, HederaTokenServiceAddress], {
    after: [CommodityExchange]
  });

  return {
    ProducerRegistry,
    HederaTokenServiceAddress,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
