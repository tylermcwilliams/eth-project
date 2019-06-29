const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HeroListing = new Schema({
  hero: {
    type: Schema.Types.ObjectId,
    ref: "heroes"
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  bestBid: Number,
  bestBidder: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  buyOut: Number
});

module.exports = mongoose.model("herolistings", HeroListing);
