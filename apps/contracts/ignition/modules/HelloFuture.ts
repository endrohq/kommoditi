import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const HelloFutureModule = buildModule("HelloFutureModule", (m) => {

  const basic = m.contract("Basic");

  return { basic };
});

export default HelloFutureModule;
