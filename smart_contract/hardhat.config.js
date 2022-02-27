require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/2SYkHbuDlnDk6bBa30dM78hmpin0XwJJ",
      accounts: [
        "2c72ce222c45f9d5d496cf88a5c8fbee15c9752fcd833e785f9212023e6c2599",
      ],
    },
  },
};
