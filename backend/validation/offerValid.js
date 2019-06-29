const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

function validateData(offerData) {
  const errors = {
    id: null,
    buyOut: null
  };

  // validate type
  if (!validator.isMongoId(offerData.id)) {
    errors.bid += "The productType must be a number. \n";
  }

  // validate buyout. It's optional
  if (offerData.buyOut && !validator.isNumeric(offerData.buyOut)) {
    errors.bid += "The buyOut must be a number. \n";
  }

  return errors.id || errors.buyOut ? errors : null;
}

module.exports = validateData;
