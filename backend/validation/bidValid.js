const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

function validateData(bidData) {
  const errors = {
    id: null,
    bid: null
  };

  // validate type
  if (!validator.isMongoId(bidData.id)) {
    errors.bid += "The productType must be a number. \n";
  }

  // validate bid
  if (!validator.isNumeric(bidData.bid)) {
    errors.bid += "The bid must be a number. \n";
  }
  if (bidData.bid <= 0) {
    errors.bid += "The bid must be greater than zero \n";
  }

  return errors.id || errors.bid ? errors : null;
}

module.exports = validateData;
