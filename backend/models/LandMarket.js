const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Market = new Schema({
  land: {
    type: Schema.Types.ObjectId,
    ref: "Land"
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  bestBid: Number,
  bestBidder: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  buyOut: Number
});

module.exports = mongoose.model("landmarket", Market);
