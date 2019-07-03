const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemToken = new Schema({
  rarity: Number,
  name: String,

  slot: Number,

  atk: Number,
  def: Number,
  int: Number,
  spd: Number,

  bonus: Number,
  bonusModifier: Number,

  issued: Number,
  amount: Number
});

module.exports = mongoose.model("itemtokens", ItemToken);
