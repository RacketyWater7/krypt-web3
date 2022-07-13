// https://eth-goerli.g.alchemy.com/v2/yksHk65c2k7j8NsOio_sndfB1aPdDK7G

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/yksHk65c2k7j8NsOio_sndfB1aPdDK7G",
      accounts: [
        "35739a37f1851a654dceb5fbf5aec5c991753cd09bf5fc06e2815777c2c2131d",
      ],
    },
  },
};
