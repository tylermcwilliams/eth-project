const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  name: String,
  email: String,

  nonce: Number,
  address: String,

  balance: Number,

  empire: Number
});

User.index({ empire: 1 });

User.module.exports = mongoose.model("User", User);
