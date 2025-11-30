import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MoreFunToken...");
  const Token = await ethers.getContractFactory("MoreFunToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("MoreFunToken deployed to:", tokenAddr);

  console.log("Deploying GameVault...");
  const Vault = await ethers.getContractFactory("GameVault");
  const vault = await Vault.deploy(tokenAddr);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("GameVault deployed to:", vaultAddr);
}

main().catch(console.error);
