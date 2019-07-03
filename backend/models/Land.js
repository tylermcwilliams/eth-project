const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Land = new Schema({
  type: Number,
  income: Number,
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },

  bonus: Number,
  bonusModifier: Number,

  buildings: {
    slotOne: Number,
    slotTwo: Number,
    slotThree: Number
  },

  inmarket: Number // 0: no, 1: pending, 2: yes
});

//Land.index({ owner: 1 });

module.exports = mongoose.model("lands", Land);
