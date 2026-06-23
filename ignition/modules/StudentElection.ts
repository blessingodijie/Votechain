import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ElectionModule", (m) => {
  const Election = m.contract("StudentElection");
  return { Election };
});