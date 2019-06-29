const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Market = new Schema({
  item: {
    type: Schema.Types.ObjectId,
    ref: "Item"
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

module.exports = mongoose.model("itemmarket", Market);
