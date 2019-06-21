const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HeroToken = new Schema({
  type: Number,
  level: Number
});

module.exports = mongoose.model("HeroToken", HeroToken);
