const router = require("express").Router();
const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");
const jwt = require("jsonwebtoken");

const { secret } = require("../config/keys");
const User = require("../models/User");

// GET /:id
// Retrieves a user by address or username
router.get("/:id", (req, res) => {
  User.findOne(
    { $or: [{ address: req.params.id }, { name: req.params.id }] },
    (err, user) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (user) {
        return res.json({
          name: user.name,
          address: user.address,
          empire: user.empire,
          lands: [...lands],
          heroes: [...user.heroes]
        });
      } else {
        return res.status(404).json({ message: "User not found." });
      }
    }
  );
});

// GET /nonce/:address
// gets user's nonce
router.get("/nonce/:address", (req, res) => {
  // return if address is invalid
  if (!ethUtil.isValidAddress(req.body.address)) {
    res.status(400).json({ error: "The address specified is invalid." });
  }
  // if address doesn't exist, register it
  User.findOne({ address: req.body.address }, (err, user) => {
    if (err) {
      res.status(400).json(err);
    }
    if (!user) {
      // create new user
      const newUser = new User({
        address: req.body.address,
        nonce: Math.floor(Math.random * 10000)
      });

      newUser.save((err, newuser) => {
        if (err) {
          res.status(400).json(err);
        }
        user = newuser;
      });
    }

    res.json({ nonce: user.nonce });
  });
});

// POST /login
// Logs in a user,info is in body
router.post("/login", (req, res) => {
  // return if address is invalid
  if (!ethUtil.isValidAddress(req.body.address)) {
    res.status(400).json({ error: "The address specified is invalid." });
  }
  // return if address already exists
  User.findOne({ address: req.body.address }, (err, user) => {
    if (err) {
      res.status(400).json(err);
    }
    // if user doesn't exist, return
    if (!user) {
      res.status(400).json({ message: "User doesn't exist." });
    }
    // verification of signiature
    const msg =
      "Please sign this request in order to log in. Code: " + user.nonce;

    const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, "utf8"));
    const address = sigUtil.recoverPersonalSignature({
      data: msgBufferHex,
      sig: req.body.signiature
    });
    if (address.toLowerCase() !== publicAddress.toLowerCase()) {
      return res.status(401).send({ error: "Signature verification failed" });
    }
    // create new nonce for user
    user.nonce = Math.floor(Math.random * 10000);
    user.save();
    // generation of jwt token
    jwt.sign(
      {
        id: user.id,
        address: user.address
      },
      secret,
      {},
      (err, token) => {
        if (err) {
          res.status(500).json(err);
        }
        res.json({
          message: "Authenticated",
          token: "Bearer" + token
        });
      }
    );
  });
});

module.exports = router;
