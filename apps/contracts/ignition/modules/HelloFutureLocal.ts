import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {
  const ProducerRegistry = m.contract("ProducerRegistry");

  const MockTokenService = m.contract("MockHederaTokenService");
  const CommodityExchange = m.contract("CommodityExchange", [MockTokenService], {
    after: [MockTokenService]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, MockTokenService], {
    after: [CommodityExchange]
  });

  return {
    ProducerRegistry,
    MockTokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
