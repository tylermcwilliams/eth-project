const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Market = new Schema({
  start: Date,
  product: {
    type: Schema.Types.ObjectId
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  bidder: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  minimumPrice: Number,
  buyOut: Number
});

module.exports = mongoose.model("Market", Market);
