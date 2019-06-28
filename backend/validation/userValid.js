const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

const User = require("../models/User");

function validateData(userData) {
  const errors = {
    name,
    email
  };

  // check if input is valid before searching for user
  if (!validator.isAlphanumeric(userData.name)) {
    errors.name += "n Name must contain only letters and numbers.";
  }
  if (!validator.isLength(userData.name, 3, 12)) {
    errors.name += "n Name must be between 3 and 12 digits.";
  }
  if (filter.check(userData.name)) {
    errors.name += "n Name cannot contain offensive words.";
  }

  // email
  if (!validator.isEmail(userData.email)) {
    errors.email += "n Invalid email.";
  }
  if (filter.check(userData.email)) {
    errors.email += "n Email cannot contain profanity.";
  }

  return errors.email || errors.name ? errors : {};
}

module.exports = validateData;
