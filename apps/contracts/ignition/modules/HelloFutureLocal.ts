import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {
  const ProducerRegistry = m.contract("ProducerRegistry");

  const MockTokenService = m.contract("MockHederaTokenService");

  const CreateCacaoToken = m.call(MockTokenService, "createFungibleToken", [
    {
      name: "CACAO Token",
      symbol: "CACAO",
      treasury: m.getAccount(0),
      memo: "Real World Asset Token for CACAO",
      tokenSupplyType: false,
      maxSupply: 0,
      freezeDefault: false,
      expiry: {
        second: 0,
        autoRenewPeriod: 0
      }
    },
    0, // Initial supply
    0, // Decimals
    []
  ]);


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
    CreateCacaoToken,
  }
});

export default HelloFutureModule;
