const mongoose = require("mongoose");

const User = require("../models/User");
const HeroListing = require("../models/HeroListing");
const ItemListing = require("../models/ItemListing");
const LandListing = require("../models/LandListing");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");

const minter = require("../dapp/minting");

module.exports = async function transfer(tx) {
  const { user, type, product } = tx;

  const session = await mongoose.startSession();
  session.startTransaction();

  let schema;
  switch (type) {
    case "hero":
      schema = Hero;
      break;
    case "item":
      schema = Item;
      break;
    case "land":
      schema = Land;
      break;
    default:
      throw new Error("Invalid Type");
  }

  await schema.findByIdAndUpdate(product, { inmarket: 1 });
  await User.findByIdAndUpdate(user, { $inc: { balance: -50 } });

  // lastly await minting
  await minter(user, type);
};
