const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Land = new Schema({
  serial: Number,
  type: Number,
  income: Number,
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  bonus: Number,
  bonusModifier: Number,

  buildings: [Number]
});

Land.index({ owner: 1 });

module.exports = mongoose.model("land", Land);
