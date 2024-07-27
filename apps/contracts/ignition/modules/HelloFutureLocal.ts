import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {

  const ProducerRegistry = m.contract("ProducerRegistry");
  const CommodityFactory = m.contract("CommodityFactory");

  const TokenService = m.contract("HederaTokenService", [], {
    after: [ProducerRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory],{
    after: [ProducerRegistry, CommodityFactory]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, TokenService], {
    after: [CommodityExchange, TokenService]
  });

  m.call(TokenAuthority, 'createCommodity', ['Cacao', 'CACAO'], {
    id: 'createCacao'
  })
  m.call(TokenAuthority, 'createCommodity', ['Grain', 'GRAIN'], {
    id: 'createGrain'
  })
  m.call(TokenAuthority, 'createCommodity', ['Basmati Rice', 'BASMATI'], {
    id: 'createBasmati'
  })
  m.call(TokenAuthority, 'createCommodity', ['Coffee Beans', 'COFFEE'], {
    id: 'createCoffee'
  })

  m.call(TokenAuthority, 'getCommodities', [], {
    id: 'getCommodities'
  })

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityExchange, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);


  return {
    ProducerRegistry,
    TokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
