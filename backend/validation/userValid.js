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
    errors.name += "Name must contain only letters and numbers. \n";
  }
  if (!validator.isLength(userData.name, 3, 12)) {
    errors.name += "Name must be between 3 and 12 digits.\n";
  }
  if (filter.check(userData.name)) {
    errors.name += "Name cannot contain offensive words. \n";
  }

  // email
  if (!validator.isEmail(userData.email)) {
    errors.email += "Invalid email. \n";
  }
  if (filter.check(userData.email)) {
    errors.email += "Email cannot contain profanity. \n";
  }

  return errors.email || errors.name ? errors : {};
}

module.exports = validateData;
