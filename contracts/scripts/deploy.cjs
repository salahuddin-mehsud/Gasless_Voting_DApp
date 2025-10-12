const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying GaslessVoting contract...");
  
  const GaslessVoting = await ethers.getContractFactory("GaslessVoting");
  const gaslessVoting = await GaslessVoting.deploy();
  
  await gaslessVoting.waitForDeployment();
  
  const address = await gaslessVoting.getAddress();
  console.log("GaslessVoting deployed to:", address);
  
  // Verify contract (if on supported network)
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for block confirmations...");
    await gaslessVoting.deploymentTransaction().wait(5);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});