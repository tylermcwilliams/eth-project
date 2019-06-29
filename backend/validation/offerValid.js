const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

function validateData(offerData) {
  const errors = {
    id: "",
    buyOut: ""
  };

  // validate type
  if (!validator.isMongoId(offerData.id)) {
    errors.id += "Nothing found by this id.";
  }

  // validate buyout. It's optional
  if (offerData.buyOut && !validator.isNumeric(offerData.buyOut)) {
    errors.bid += "The buyOut must be a number.";
  }

  return errors.id || errors.buyOut ? errors : null;
}

module.exports = validateData;
