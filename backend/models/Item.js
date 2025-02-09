const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Item = new Schema({
  type: {
    type: Schema.Types.ObjectId,
    ref: "itemtokens"
  },
  name: String,
  hero: {
    type: Schema.Types.ObjectId,
    ref: "heroes"
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  
  inmarket: Number // 0: no, 1: pending, 2: yes
});

//Item.index({ owner: 1, hero: 1 });

module.exports = mongoose.model("items", Item);
