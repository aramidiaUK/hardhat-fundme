const networkConfig = {
  5: {
    name: "Goerli",
    ethUsdPriceFeedAddress: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
  },
  137: {
    name: "Matic",
    ethUsdPriceFeedAddress: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
  },
  31337: {
    name: "localhost",
    ethUsdPriceFeedAddress: "0x345",
  }
};

const developmentConfig = {
  developmentChains: ["hardhat", "localhost"],
  constructorArgs: {
    decimals: 8,
    initialAnswer: 200000000
  }
};

module.exports = {
  networkConfig,
  developmentConfig
};
