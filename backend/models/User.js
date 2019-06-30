const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = new Schema({
  name: String,
  email: String,

  nonce: Number,
  address: String,

  balance: Number,
  income: Number,

  empire: Number,

  joinDate: Date,
  lastLogin: Date
});

//User.index({ empire: 1 });
//User.index({ address: 1 });

module.exports = mongoose.model("users", User);
