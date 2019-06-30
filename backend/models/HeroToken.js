const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HeroToken = new Schema({
  serial: Number,
  rarity: Number,
  name: String,

  atk: Number,
  def: Number,
  int: Number,
  spd: Number,

  bonus: Number,
  bonusModifier: Number,

  issued: Number,
  amount: Number
});

module.exports = mongoose.model("herotokens", HeroToken);
