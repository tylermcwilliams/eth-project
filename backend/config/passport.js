const { Strategy, ExtractJwt } = require("passport-jwt");
const { jwtSecret } = require("./keys");
const User = require("../models/User");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
};

const validateJwt = passport => {
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      User.findOne({ address: jwt_payload.address }, (err, user) => {
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};

module.exports = validateJwt;
