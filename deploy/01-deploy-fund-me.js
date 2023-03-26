// import
const { networkConfig } = require("../helper-hardhat-config")
const { developmentConfig } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  // if chainId is X user Address Y
  // if chainId is Y user Address Z
  //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]

  let ethUsdPriceFeedAddress
  if (developmentConfig["developmentChains"].includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeedAddress"]
  }

  // if the contract doesn't exist, deploy  a minimal version of it for local testing

  // well what happens when we want to change chains
  // when going for localhost or hardhat network we want to user a mock
  const args = [ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args, //Address
    log: true,
    waitConfirmation: network.config.blockConfirmations || 1
  })

  if (
    !developmentConfig["developmentChains"].includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }
  log("------------------------------------------------------------")
}

module.exports.tags = ["all", "fund-me"]
