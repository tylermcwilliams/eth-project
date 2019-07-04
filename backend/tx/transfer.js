const mongoose = require("mongoose");

const User = require("../models/User");
const HeroListing = require("../models/HeroListing");
const ItemListing = require("../models/ItemListing");
const LandListing = require("../models/LandListing");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");

module.exports = async function transfer(tx) {
  const { type, buyer, seller, product, listing, price, isfinal } = tx;

  const session = await mongoose.startSession();
  session.startTransaction();

  let Market;
  let schema;
  switch (type) {
    case "hero":
      Market = HeroListing;
      schema = Hero;
      break;
    case "item":
      Market = ItemListing;
      schema = Item;
      break;
    case "land":
      Market = LandListing;
      schema = Land;
      break;
    default:
      throw new Error("Invalid Type");
  }

  try {
    const opts = { session };

    if (isfinal) {
      const buyerInst = await User.findOneAndUpdate(
        { _id: buyer },
        { $inc: { balance: -price } },
        opts
      );

      if (buyerInst.balance < 0) {
        throw new Error("Buyer cannot afford this bid.");
      }
    }

    await User.findOneAndUpdate(
      { _id: seller },
      { $inc: { balance: +price } },
      opts
    );
    await schema.findOneAndUpdate({ _id: product }, { owner: buyer }, opts);
    await Market.findOneAndDelete({ _id: listing }, opts);

    await session.commitTransaction();
    session.endSession();
    return tx;
  } catch (error) {
    // If an error occurred, abort the whole transaction and
    // undo any changes that might have happened
    await session.abortTransaction();
    session.endSession();
    throw error; // Rethrow so calling function sees error
  }
};
