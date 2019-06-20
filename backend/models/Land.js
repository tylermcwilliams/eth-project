const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Land = new Schema({
  id: Number,
  type: Number,
  bonus: Number,
  income: Number,
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },

  buildings: [Number]
});

module.exports = mongoose.model("Land", Land);
