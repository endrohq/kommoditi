import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {

  const ParticipantRegistry = m.contract("ParticipantRegistry");
  const CommodityFactory = m.contract("CommodityFactory", [ParticipantRegistry, false], {
    after: [ParticipantRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory, ParticipantRegistry],{
    after: [ParticipantRegistry, CommodityFactory]
  });

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);

  /*let tokenFutures = [];
  for (const tokens of commodityTokens) {
   const tokenDeployment = m.call(CommodityExchange, 'createCommodityToken', [tokens.name, tokens.symbol], {
      id: tokens.id,
      after: [CommodityFactory, TokenAuthority]
    })
    tokenFutures.push(tokenDeployment);
  }*/

  /*for (const producer of participantsOnDevnet) {
    m.call(ParticipantRegistry, 'registerParticipant', [producer.name, producer.overheadPercentage, producer.type, producer.locations], {
      from: producer.account,
      id: `registerParticipant_${producer.name?.replace(/\s/g, '')}`,
    })
  }*/

  /*for (const listing of listings) {
    m.call(CommodityExchange, 'listCommodity', [listing.token, listing.quantity], {
      id: listing.id,
      from: listing.producer,
      after: tokenFutures
    })
  }*/

  return {
    ParticipantRegistry,
    CommodityExchange,
  }
});

export default HelloFutureModule;
