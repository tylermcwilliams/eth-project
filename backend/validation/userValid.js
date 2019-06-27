const filter = require("leo-profanity");
const isEmpty = require("is-empty");
const validator = require("validator");

const User = require("../models/User");

function validateData(userData, cb) {
  const errors = {
    name: [],
    email: []
  };

  // check if input is valid before searching for user
  if (!validator.isAlphanumeric(userData.name)) {
    errors.name.push("Name must contain only letters and numbers.");
  }
  if (!validator.isLength(userData.name, 3, 12)) {
    errors.name.push("Name must be between 3 and 12 digits.");
  }
  if (filter.check(userData.name)) {
    errors.name.push("Name cannot contain offensive words.");
  }

  // email
  if (!validator.isEmail(userData.email)) {
    errors.email.push("Invalid email.");
  }
  if (filter.check(userData.email)) {
    errors.email.push("Email cannot contain profanity.");
  }

  // check if info is taken by someone else
  User.findOne(
    { $or: [{ name: userData.name }, { email: userData.email }] },
    (err, user) => {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb();
      }
      if (user.address.toLowerCase() !== userData.address.toLowerCase()) {
        if (userData.name == user.name) {
          errors.name.push("This username has already been taken");
        }
        if (userData.email == user.email) {
          errors.email.push("This email has already been taken");
        }
        return cb(errors);
      }
    }
  );
}

module.exports = validateData;
