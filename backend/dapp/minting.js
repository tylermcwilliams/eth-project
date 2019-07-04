const HDWalletProvider = require("truffle-hdwallet-provider");
const web3 = require("web3");
const MNEMONIC = process.env.MNEMONIC;
const INFURA_KEY = process.env.INFURA_KEY;
const HERO_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const ITEM_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const LAND_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS;
const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const NETWORK = process.env.NETWORK;

const NFT_ABI = require("./contracts/nft_abi");

async function mint(to, type, tokenId) {
  let contractAddress;

  switch (type) {
    case "hero":
      contractAddress = HERO_CONTRACT_ADDRESS;
      break;
    case "item":
      contractAddress = ITEM_CONTRACT_ADDRESS;
      break;
    case "land":
      contractAddress = LAND_CONTRACT_ADDRESS;
      break;
    default:
      throw new Error("Invalid contract type");
  }

  const provider = new HDWalletProvider(
    MNEMONIC,
    `https://${NETWORK}.infura.io/v3/${INFURA_KEY}`
  );
  const web3Instance = new web3(provider);

  const contract = new web3Instance.eth.Contract(NFT_ABI, contractAddress, {
    gasLimit: "1000000"
  });

  return await contract.mintTo(to).send({ from: OWNER_ADDRESS });
}
