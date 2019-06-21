const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemToken = new Schema({
  serial: Number,
  rarity: Number,
  name: String,

  slot: Number,

  attack: Number,
  defence: Number,
  intelligence: Number,

  bonus: Number,
  bonusModifier: Number
});

module.exports = mongoose.model("ItemToken", ItemToken);