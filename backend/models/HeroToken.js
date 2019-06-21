const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HeroToken = new Schema({
  serial: Number,
  rarity: Number,
  name: String,

  attack: Number,
  defence: Number,
  intelligence: Number,

  bonus: Number,
  bonusModifier: Number,

  issued: Number,
  amount: Number
});

module.exports = mongoose.model("HeroToken", HeroToken);
