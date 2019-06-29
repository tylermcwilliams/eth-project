const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LandListings = new Schema({
  land: {
    type: Schema.Types.ObjectId,
    ref: "lands"
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

module.exports = mongoose.model("landlistings", LandListings);
