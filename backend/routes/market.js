const router = require("express").Router();
const passport = require("passport");
const isEmpty = require("is-empty");

const bidValid = require("../validation/bidValid");
const offerValid = require("../validation/offerValid");

const User = require("../models/User");
const HeroListing = require("../models/HeroListing");
const ItemListing = require("../models/ItemListing");
const LandListing = require("../models/LandListing");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");

// GET /all/:type
// the entire market
router.get("/all/:type", (req, res) => {
  let Market;
  switch (req.params.type) {
    case "hero":
      Market = HeroListing;
      break;
    case "item":
      Market = ItemListing;
      break;
    case "land":
      Market = LandListing;
      break;
    default:
      return res.status(400).json({ error: "Invalid market type." });
  }

  Market.find({})
    .populate("product owner")
    .exec((err, listings) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!listings) {
        return res.status(404).json({
          error: "Market is empty."
        });
      }
      return res.json({
        listings: [...listings]
      });
    });
});

// GET /:type/:id
// get individual product for sale
router.get("/:type/:id", (req, res) => {
  let Market;
  switch (req.params.type) {
    case "hero":
      Market = HeroListing;
      break;
    case "item":
      Market = ItemListing;
      break;
    case "land":
      Market = LandListing;
      break;
    default:
      return res.status(400).json({ error: "Invalid market type." });
  }
  Market.findById(req.params.id)
    .populate("product owner")
    .exec((err, listing) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!listing) {
        return res.status(404).json({
          error: "Listing not found."
        });
      }
      return res.json({
        listing: listing[req.params.type],
        owner: listing.owner,
        buyOut: listing.buyOut,
        bestBid: listing.bestBid
      });
    });
});

// POST /sell/:type/:id
// sets up individual product for sale
// {
//  productType : Number (0: Hero, 1. Item, 2: Land)
//  buyOut : Number
// }
router.post(
  "/sell/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const inputErrors = offerValid({
      id: req.params.id,
      buyOut: req.body.buyOut
    });

    if (inputErrors) {
      return res.status(400).json(inputErrors);
    }

    let Market;
    let schema;
    switch (req.params.type) {
      case "hero":
        Market = HeroListing;
        schema = Hero;
        break;
      case "item":
        Market = ItemListing;
        schema = Item;
        break;
      case "land":
        Market = LandListing;
        schema = Land;
        break;
      default:
        return res.status(400).json({ error: "Invalid market type." });
    }

    schema.findOne(
      { owner: req.user.id, _id: req.params.id },
      (err, product) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!product) {
          return res.status(400).json({
            error: "You cannot sell this."
          });
        }
        // check if it's already on the market
        Market.findOne({ product: product.id }, (err, listing) => {
          if (err) {
            return res.status(400).json(err);
          }
          if (listing) {
            return res.status(400).json({
              error: "This is already for sell."
            });
          }

          const newOrder = new Market({
            product: product.id,
            owner: req.user.id,
            buyOut: req.body.buyOut ? req.body.buyOut : 0
          });
          newOrder.save();
          return res.json({ message: "Successfully added." });
        });
      }
    );
  }
);

// POST /buy/:id
// buys individual product for sale
// {
//  productType : Number (0: Hero, 1. Item, 2: Land)
//  bid : Number above 0
// }
router.post(
  "/buy/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const inputErrors = bidValid({
      id: req.params.id,
      type: req.params.type,
      bid: req.body.bid
    });

    if (inputErrors) {
      return res.status(400).json(inputErrors);
    }

    // if bidder can't afford
    if (req.user.balance && req.user.balance < req.body.bid) {
      return res.status(400).json({
        error: "You cannot afford this bid."
      });
    }

    let Market;
    switch (req.params.type) {
      case "hero":
        Market = HeroListing;
        break;
      case "item":
        Market = ItemListing;
        break;
      case "land":
        Market = LandListing;
        break;
      default:
        return res.status(400).json({ error: "Invalid market type." });
    }

    Market.findById(req.params.id)
      .populate("owner bestBidder " + req.params.type)
      .exec((err, listing) => {
        if (err) {
          return res.status(400).json(err);
        }
        // if listing doesn't exist or isn't populated
        if (
          !listing ||
          !listing.populated("owner") ||
          !listing.populated("product")
        ) {
          return res.status(404).json({
            error: "Unable to place bid."
          });
        }
        // if bidder is owner
        if (req.user.id == listing.owner) {
          res.status(400).json({ error: "You can't bid your own listing." });
        }
        // if the bid is less than highest
        if (listing.bestBid > req.body.bid) {
          return res.status(400).json({
            error: "Bid is too low."
          });
        }

        // finalize sale
        // return money to best bidder. If it got this far, the new bid is higher
        if (listing.bestBidder) {
          listing.bestBidder.balance += listing.bestBid;
          listing.bestBidder.save();
        }
        // buyout, else bid
        if (req.body.bid >= listing.buyOut) {
          // money exchange
          listing.owner.balance += listing.buyOut;
          req.user.balance -= req.body.buyOut;
          listing.owner.save();
          req.user.save();
          //
          listing[req.params.type].owner = req.user.id;
          listing[req.params.type].save();
          listing.remove();
        } else {
          listing.bestBidder = req.user.id;
          listing.bestBid = req.body.bid;
          req.user.balance -= req.body.bid;
          req.user.save();
          listing.save();
        }
        return res.json({ message: "Successfully placed bid." });
      });
  }
);

// POST /edit/:type/:id
// edits individual product for sale
// {
//  productType : Number (0: Hero, 1. Item, 2: Land)
//  buyOut : Number
// }
router.post(
  "/edit/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const inputErrors = offerValid({
      id: req.params.id,
      type: req.params.type,
      buyOut: req.body.buyOut
    });

    if (inputErrors) {
      return res.status(400).json(inputErrors);
    }

    let Market;
    switch (req.params.type) {
      case "hero":
        Market = HeroListing;
        break;
      case "item":
        Market = ItemListing;
        break;
      case "land":
        Market = LandListing;
        break;
      default:
        return res.status(400).json({ error: "Invalid market type." });
    }

    Market.findById(req.params.id, (err, listing) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!listing || listing.owner != req.user.id) {
        return res.status(404).json({
          error: "Listing not found."
        });
      }

      // if the new price is less than highest bid, return
      if (listing.bestBid && listing.bestBid > req.body.buyOut) {
        return res.status(400).json({
          error: "Cannot post buyOut less than highest bid!"
        });
      }

      listing.buyOut = req.body.buyOut;
      listing.save();

      return res.json({ message: "Successfully edited sale." });
    });
  }
);

// DELETE /accept/:id
// accepts the highest bid
router.delete(
  "/accept/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let Market;
    switch (req.params.type) {
      case "hero":
        Market = HeroListing;
        break;
      case "item":
        Market = ItemListing;
        break;
      case "land":
        Market = LandListing;
        break;
      default:
        return res.status(400).json({ error: "Invalid market type." });
    }

    Market.findById(req.params.id)
      .populate("owner bestBidder " + req.params.type)
      .exec((err, listing) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!listing || listing.owner.id != req.user.id) {
          res.status(404).json({
            error: "Listing not found."
          });
        }

        if (!listing.bestBidder || !listing.bestBid) {
          res.status(400).json({
            error: "You do not have any bids."
          });
        }

        req.user.balance += listing.bestBid;
        listing.owner = listing.bestBidder;
        listing[req.params.type].save();
        req.user.save();
        listing.remove();

        return res.json({ message: "Successfully accepted bid." });
      });
  }
);

// DELETE /delete/:type/:id
// deletes individual product for sale
router.delete(
  "/delete/:type/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    let Market;
    switch (req.params.type) {
      case "hero":
        Market = HeroListing;
        break;
      case "item":
        Market = ItemListing;
        break;
      case "land":
        Market = LandListing;
        break;
      default:
        return res.status(400).json({ error: "Invalid market type." });
    }

    Market.findById(req.params.id)
      .populate("bestBidder")
      .exec((err, listing) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!listing || listing.owner != req.user.id) {
          return res.status(404).json({
            error: "Listing not found."
          });
        }

        if (listing.bestBidder) {
          listing.bestBidder.balance += listing.bestBid;
          listing.bestBidder.save();
        }
        listing.remove();

        return res.json({ message: "Successfully removed sale." });
      });
  }
);

module.exports = router;
