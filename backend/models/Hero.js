const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//

const Hero = new Schema({
  type: {
    type: Schema.Types.ObjectId,
    ref: "herotokens"
  },
  level: Number,
  experience: Number,
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: "users"
  },
  units: [
    {
      type: Number,
      amount: Number
    }
  ]
});

Hero.index({ owner: 1 });

module.exports = mongoose.model("heroes", Hero);
