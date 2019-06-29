const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemListing = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: "items"
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

module.exports = mongoose.model("itemlistings", ItemListing);
