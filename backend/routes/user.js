const router = require("express").Router();
const passport = require("passport");
const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");
const jwt = require("jsonwebtoken");
const isEmpty = require("is-empty");
const userValid = require("../validation/userValid");

const { jwtSecret } = require("../config/keys");
const User = require("../models/User");

// GET /:id
// Retrieves a user by address or username
router.get("/:id", (req, res) => {
  User.findOne(
    {
      $or: [{ _id: req.params.id }, { name: req.params.id }]
    },
    (err, user) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (user) {
        return res.json({
          name: user.name,
          address: user.id,
          empire: user.empire
        });
      } else {
        return res.status(404).json({ error: "User not found." });
      }
    }
  );
});

// GET /nonce/:address
// Gets user's nonce, creates user
router.get("/nonce/:address", (req, res) => {
  // return if address is invalid
  if (!ethUtil.isValidAddress(req.params.address)) {
    return res.status(400).json({ error: "The address specified is invalid." });
  }
  // if address doesn't exist, register it
  User.findById(req.params.address, (err, user) => {
    if (err) {
      return res.status(400).json(err);
    }
    if (!user) {
      // create new user
      const newUser = new User({
        _id: req.params.address,
        name: req.params.address,
        balance: 0,
        nonce: Math.floor(Math.random() * 10000)
      });

      newUser.save((err, saved) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.json({ nonce: saved.nonce });
      });
    } else {
      return res.json({ nonce: user.nonce });
    }
  });
});

// POST /login
// Logs in a user
router.post("/login", (req, res) => {
  // return if address is invalid
  if (!ethUtil.isValidAddress(req.body.address)) {
    return res.status(400).json({ error: "The address specified is invalid." });
  }
  // return if address already exists
  User.findOne({ address: req.body.address }, (err, user) => {
    if (err) {
      return res.status(400).json(err);
    }
    // if user doesn't exist, return
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist." });
    }
    // verification of signiature
    const msg =
      "Please sign this request in order to log in. Code: " + user.nonce;

    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
    const address = sigUtil.recoverPersonalSignature({
      data: msgBufferHex,
      sig: req.body.signiature
    });
    if (address.toLowerCase() !== user.address.toLowerCase()) {
      return res.status(401).send({ error: "Signature verification failed" });
    }
    // create new nonce for user
    user.nonce = Math.floor(Math.random() * 10000);
    user.save((err, saved) => {
      if (err) {
        return res.status(400).json(err);
      }

      jwt.sign(
        {
          id: saved.id,
          address: saved.address
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) {
            return res.status(500).json(err);
          }
          return res.json({
            message: "Authenticated",
            token: "Bearer" + token,
            user: saved
          });
        }
      );
    });
  });
});

// POST /edit
// Edits a user. It's up to the front end to fill out the parameters. Empty parameters are accepted.
router.post(
  "/edit",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // validation
    const errors = userValid({
      name: req.body.name,
      email: req.body.email
    });

    if (errors) {
      return res.status(400).json(errors);
    }

    User.findOne(
      { $or: [{ name: req.body.name }, { email: req.body.email }] },
      (err, user) => {
        if (err) {
          return res.status(400).json(err);
        }

        if (!user) {
          req.user.name = isEmpty(req.body.name)
            ? req.user.address
            : req.body.name;

          req.user.email = req.body.email;
          req.user.save((err, saved) => {
            if (err) {
              return res.status(400).json(err);
            }

            return res.json({
              message: "Successfully updated user",
              user: saved
            });
          });
        }

        if (user.address.toLowerCase() !== req.body.address.toLowerCase()) {
          return res.status(400).json({
            name:
              req.body.name == user.name
                ? "This username has already been taken"
                : "",
            email:
              req.body.email == user.email
                ? "This email has already been taken"
                : ""
          });
        }
      }
    );
  }
);

module.exports = router;
