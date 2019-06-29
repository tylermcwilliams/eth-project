const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

function validateData(bidData) {
  const errors = {
    id: "",
    bid: ""
  };

  // validate type
  if (!validator.isMongoId(bidData.id)) {
    errors.bid += "Nothing found by this id.";
  }

  // validate bid
  if (!validator.isNumeric(bidData.bid)) {
    errors.bid += "The bid must be a number.";
  }
  if (bidData.bid <= 0) {
    errors.bid += "The bid must be greater than zero.";
  }

  return errors.id || errors.bid ? errors : null;
}

module.exports = validateData;
