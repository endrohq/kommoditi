import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {

  const ProducerRegistry = m.contract("ProducerRegistry");

  const TokenService = m.contract("HederaTokenService", [], {
    after: [ProducerRegistry]
  });
  const CommodityExchange = m.contract("CommodityExchange",[],{
    after: [ProducerRegistry]
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

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityExchange, "setTokenAuthority", [TokenAuthority]);


  return {
    ProducerRegistry,
    TokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
