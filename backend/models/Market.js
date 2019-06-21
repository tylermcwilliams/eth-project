const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Market = new Schema({
  type: Number,
  product: {
    type: Schema.Types.ObjectId
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

module.exports = mongoose.model("Market", Market);
