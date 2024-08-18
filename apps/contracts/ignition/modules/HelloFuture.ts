
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import {commodityTokens} from "../data";

const tokenAddress = '0x0000000000000000000000000000000000000167';
const tokenAddressTemp = '0x0000000000000000000000000000000000000167';

const HelloFutureModule = buildModule("HelloFutureModuleHederaTestnet", (m) => {

  const ParticipantRegistry = m.contract("ParticipantRegistry");
  const HederaTokenService = m.contractAt("IHederaTokenService", tokenAddress);

  const CommodityFactory = m.contract("CommodityFactory", [ParticipantRegistry, true], {
    after: [ParticipantRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory],{
    after: [ParticipantRegistry]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, HederaTokenService], {
    after: [CommodityExchange, HederaTokenService]
  });

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityExchange, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);


  return {
    ParticipantRegistry,
    HederaTokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;

/*import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";
import {commodityTokens, listings, participantsOnDevnet} from "../data";

const HelloFutureModule = buildModule("HelloFutureModuleLocal", (m) => {


  const ParticipantRegistry = m.contract("ParticipantRegistry");
  const TokenService = m.contract("MockHederaTokenService", []);
  const CommodityFactory = m.contract("CommodityFactory", [ParticipantRegistry, false], {
    after: [ParticipantRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory, ParticipantRegistry],{
    after: [ParticipantRegistry, CommodityFactory]
  });

  const TokenAuthority = m.contract("TokenAuthority", [CommodityExchange, TokenService], {
    after: [CommodityExchange, TokenService]
  });

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityExchange, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setTokenAuthority", [TokenAuthority]);
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);

  let tokenFutures = [];
  for (const tokens of commodityTokens) {
   const tokenDeployment = m.call(CommodityExchange, 'createCommodityToken', [tokens.name, tokens.symbol], {
      id: tokens.id,
      after: [CommodityFactory, TokenAuthority]
    })
    tokenFutures.push(tokenDeployment);
  }

  for (const producer of participantsOnDevnet) {
    m.call(ParticipantRegistry, 'registerParticipant', [producer.name, producer.overheadPercentage, producer.type, producer.locations], {
      from: producer.account,
      id: `registerParticipant_${producer.name?.replace(/\s/g, '')}`,
    })
  }

  for (const listing of listings) {
    m.call(CommodityExchange, 'listCommodity', [listing.token, listing.quantity], {
      id: listing.id,
      from: listing.producer,
      after: tokenFutures
    })
  }

  return {
    ParticipantRegistry,
    TokenService,
    CommodityExchange,
    TokenAuthority,
  }
});

export default HelloFutureModule;
*/
