const mongoose = require("mongoose");

const User = require("../models/User");
const HeroListing = require("../models/HeroListing");
const ItemListing = require("../models/ItemListing");
const LandListing = require("../models/LandListing");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");

module.exports = async function transfer(tx) {
  const { type, bidder, price, listing } = tx;

  const session = await mongoose.startSession();
  session.startTransaction();

  let Market;
  switch (type) {
    case "hero":
      Market = HeroListing;
      break;
    case "item":
      Market = ItemListing;
      break;
    case "land":
      Market = LandListing;
      break;
    default:
      throw new Error("Invalid Type");
  }

  try {
    const opts = { session };

    const user = await User.findOneAndUpdate(
      { _id: bidder },
      { $inc: { balance: -price } },
      opts
    );
    await Market.findOneAndUpdate(
      { _id: listing },
      { bestBidder: bidder, bestBid: price },
      opts
    );

    if (user.balance < 0) {
      throw new Error("Bidder can't afford this.");
    }

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
