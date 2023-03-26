const { getNamedAccounts, deployments, ethers } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  console.log(`Got contract FundMe at ${fundMe.address}`);
  console.log("Funding contract...");
  const transactionResponse = await fundMe.fund({
    value: ethers.utils.parseEther("100")
  });

  await transactionResponse.wait(1);
  console.log("Funded contract!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.log(error);
    process.exit(1);
  });
