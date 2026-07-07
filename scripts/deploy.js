const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy();
  await voting.waitForDeployment();

  const address = await voting.getAddress();
  console.log("Voting contract deployed to:", address);

  // Optional: create the first election right after deployment
  const tx = await voting.createElection();
  await tx.wait();
  console.log("Election #1 created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});