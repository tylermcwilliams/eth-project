const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Item = new Schema({
  type: {
    type: Schema.Types.ObjectId,
    ref: "ItemToken"
  },
  name: String,
  hero: {
    type: Schema.Types.ObjectId,
    ref: "Hero"
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
});

Item.index({ owner: 1, hero: 1 });

module.exports = mongoose.model("item", Item);
