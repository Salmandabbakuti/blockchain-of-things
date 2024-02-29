import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;
  const lockedAmount = ethers.parseEther("0.001");

  const lockInstance = await ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount
  });

  await lockInstance.waitForDeployment();
  return lockInstance;
}

main()
  .then(async (lockInstance) => {
    console.log("Lock Contract deployed to:", lockInstance.target);
    // Read from the contract
    const unlockTime = await lockInstance.unlockTime();
    console.log("Unlock time:", unlockTime.toString());

    // Write to the contract
    // const tx = await lockInstance.withdraw();
    // await tx.wait();
    // console.log("Withdrawn!");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
