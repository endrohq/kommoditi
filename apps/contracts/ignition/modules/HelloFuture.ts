
import {buildModule} from "@nomicfoundation/hardhat-ignition/modules";


const HelloFutureModule = buildModule("HelloFutureModuleHederaTestnet", (m) => {

  const ParticipantRegistry = m.contract("ParticipantRegistry");

  const CommodityFactory = m.contract("CommodityFactory", [ParticipantRegistry, true], {
    after: [ParticipantRegistry]
  });

  const CommodityExchange = m.contract("CommodityExchange",[CommodityFactory],{
    after: [ParticipantRegistry]
  });

  // Call setAuthority on the CommodityExchange contract
  m.call(CommodityFactory, "setCommodityExchange", [CommodityExchange]);

  return {
    ParticipantRegistry,
    CommodityExchange,
  }
});

export default HelloFutureModule;
