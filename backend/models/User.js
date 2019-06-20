const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = Schema({
  name: String,
  email: String,

  nonce: Number,
  address: String,

  balance: Number,

  empire: Number,
  lands: [
    {
      type: Schema.Types.ObjectId,
      ref: "Land"
    }
  ],

  items: [
    {
      type: {
        type: Schema.Types.ObjectId,
        ref: "Item"
      },
      amount: Number
    }
  ],

  heroes: [
    {
      id: Number,
      level: Number,
      items: [Number],
      units: [
        {
          type: Number,
          amount: Number
        }
      ]
    }
  ]
});

module.exports = mongoose.model("User", User);
