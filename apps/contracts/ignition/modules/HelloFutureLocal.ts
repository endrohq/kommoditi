import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {

  const ProducerRegistry = m.contract("ProducerRegistry");
  const CommodityFactory = m.contract("CommodityFactory");

  const TokenService = m.contract("MockHederaTokenService", [], {
    after: [ProducerRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory],{
    after: [ProducerRegistry, CommodityFactory]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, TokenService], {
    after: [CommodityExchange, TokenService]
  });

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityExchange, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);

  m.call(CommodityExchange, 'createCommodityToken', ['Cacao', 'CACAO'], {
    id: 'createCacao',
    after: [CommodityFactory, TokenAuthority]
  })
  m.call(CommodityExchange, 'createCommodityToken', ['Grain', 'GRAIN'], {
    id: 'createGrain',
    after: [CommodityFactory, TokenAuthority]
  })
  m.call(CommodityExchange, 'createCommodityToken', ['Basmati Rice', 'BASMATI'], {
    id: 'createBasmati',
    after: [CommodityFactory, TokenAuthority]
  })
  m.call(CommodityExchange, 'createCommodityToken', ['Coffee Beans', 'COFFEE'], {
    id: 'createCoffee',
    after: [CommodityFactory, TokenAuthority]
  })

  return {
    ProducerRegistry,
    TokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
