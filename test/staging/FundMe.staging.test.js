const { assert } = require("chai");
const { getNameddAccounts, ethers, network } = require("hardhat");
const { developmentConfig } = require("../../helper-hardhat-config");

developmentConfig.developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe;
      let deployer;
      const sendValue = ethers.utils.parseEther("1");
      beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allowes people to fund and withdraw", async function() {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalace = await fundMe.provider.getBalance(fundMe.address);
        assert.equal(endingBalace.toString(), "0");
      });
    });
