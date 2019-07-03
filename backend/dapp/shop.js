const Web3 = require("web3");
const { NETWORK_FULL } = require("../config/eth-testonly");

const { rate } = require("../config/gold");
const { goldPublicAddress } = require("../config/keys");

const web3 = new Web3(NETWORK_FULL);
