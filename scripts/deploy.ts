import { ethers } from "hardhat";

async function main() {
  const pinControllerInstance = await ethers.deployContract("PinController");

  await pinControllerInstance.waitForDeployment();
  return pinControllerInstance;
}

main()
  .then(async (pinControllerInstance) => {
    console.log(
      "PinController Contract deployed to:",
      pinControllerInstance.target
    );
    // Read from the contract
    const owner = await pinControllerInstance.owner();
    console.log("Current Owner:", owner);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
