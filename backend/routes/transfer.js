const router = require("express").Router();
const passport = require("passport");
const ethUtil = require("ethereumjs-util");
const sigUtil = require("eth-sig-util");
const jwt = require("jsonwebtoken");
const isEmpty = require("is-empty");
const userValid = require("../validation/userValid");

const User = require("../models/User");
const HeroListing = require("../models/HeroListing");
const ItemListing = require("../models/ItemListing");
const LandListing = require("../models/LandListing");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");

// TRANSACTION
// POST /out/:type/:id
// transfers out hero to ethereum
router.post(
  "/out/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (user.balance < 50) {
      return res.status(500).json({
        error: "Transfers cost 50 gold."
      });
    }

    
  }
);
