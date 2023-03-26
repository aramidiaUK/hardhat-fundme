const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentConfig } = require("../../helper-hardhat-config");

!developmentConfig.developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function() {
      let fundMe, deployer, mockV3Aggregator;
      const sendValue = ethers.utils.parseEther("200");

      beforeEach(async function() {
        // deploy the fundMe contract
        /// using hardhat-deplpoy
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        // pulls the most recent deployed contract
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });

      describe("constructor", async function() {
        it("sets the aggregator address correctly", async function() {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", async function() {
        it("Fails, id you don't send enough ETH", async function() {
          await expect(fundMe.fund()).to.be.revertedWith(
            "Didn't send enough!!"
          );
        });

        it("update the amount of ETH in the contract", async function() {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(deployer);
          assert.equal(response.toString(), sendValue.toString());
        });

        it("Adds funder to array of s_funders", async function() {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer);
        });
      });

      describe("Withdraw", async function() {
        beforeEach(async function() {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraw ETH from a single founder", async function() {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // fundMe.provider is the same as ethers.provider

          // Act
          const transactionResponse = await fundMe.withdraw(); // trigger withdraw
          const transactionReciept = await transactionResponse.wait(1); // wait for transaction to be mined
          const { gasUsed, effectiveGasPrice } = transactionReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice); // calculate gas cost (mul is a BigNumber method = multiply)

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          ); // get balance after withdraw
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // get balance after withdraw

          // Assert
          assert.equal(endingFundMeBalance, 0); // fundMe balance should be 0
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ); // deployers balance should have the startingFundMe balance added to it minus the gas cost
        });
        it("allows us to withdraw with multiple s_funders", async function() {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContrract = fundMe.connect(accounts[i]);
            await fundMeConnectedContrract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReciept = await transactionResponse.wait(1); // wait for transaction to be mined
          const { gasUsed, effectiveGasPrice } = transactionReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice); // calculate gas cost (mul is a BigNumber method = multiply)

          // Assert
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          ); // get balance after withdraw
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // get balance after withdraw

          assert.equal(endingFundMeBalance, 0); // fundMe balance should be 0
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ); // deployers balance should have the startingFundMe balance added to it minus the gas cost

          // reset s_funders array
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 5; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("Only allows owner to withdraw", async function() {
          const accounts = await ethers.getSigners();
          const attackerConnectedContract = await fundMe.connect(accounts[1]);
          await expect(attackerConnectedContract.withdraw()).to.be.reverted;
        });

        it("Cheaper withdraw testing...", async function() {
          const accounts = await ethers.getSigners();
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContrract = fundMe.connect(accounts[i]);
            await fundMeConnectedContrract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // Act
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReciept = await transactionResponse.wait(1); // wait for transaction to be mined
          const { gasUsed, effectiveGasPrice } = transactionReciept;
          const gasCost = gasUsed.mul(effectiveGasPrice); // calculate gas cost (mul is a BigNumber method = multiply)

          // Assert
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.address
          ); // get balance after withdraw
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          ); // get balance after withdraw

          assert.equal(endingFundMeBalance, 0); // fundMe balance should be 0
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          ); // deployers balance should have the startingFundMe balance added to it minus the gas cost

          // reset s_funders array
          await expect(fundMe.getFunder(0)).to.be.reverted;

          for (let i = 0; i < 5; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });
      });
    });
