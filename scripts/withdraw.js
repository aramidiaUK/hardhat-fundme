const { getNamedAccounts, deployments, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);

  console.log("Funding contract...");
  const transactionResponse = await fundMe.withdraw();

  await transactionResponse.wait(1);
  console.log("Withdrew funds!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
