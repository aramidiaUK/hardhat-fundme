const { network } = require("hardhat")
const { developmentConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  console.log("network.name", network.name)
  console.log("deployer", deployer)

  if (developmentConfig["developmentChains"].includes(network.name)) {
    log("Local newtork detected, deploying mock contracts...")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [
        developmentConfig["constructorArgs"]["decimals"],
        developmentConfig["constructorArgs"]["initialAnswer"]
      ]
    })
    log("Mocks deployed!!")
    log("-----------------------------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
