const router = require("express").Router();
const passport = require("passport");

const bidValid = require("../validation/bidValid");
const offerValid = require("../validation/offerValid");

const transfer = require("../tx/transfer");
const bid = require("../tx/bid");

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
        Market.findOne({ [req.params.type]: product.id }, (err, listing) => {
          if (err) {
            return res.status(400).json(err);
          }
          if (listing) {
            return res.status(400).json({
              error: "This is already for sell."
            });
          }

          const newListing = new Market({
            [req.params.type]: product.id,
            owner: req.user.id,
            buyOut: req.body.buyOut ? req.body.buyOut : 0
          });
          newListing.save((err, saved) => {
            if (err) {
              return res.status(400).json(err);
            }
            return res.json({ message: "Successfully added.", listing: saved });
          });
        });
      }
    );
  }
);

// TRANSACTION
// POST /buy/:type/:id
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
          !listing.populated(req.params.type)
        ) {
          return res.status(404).json({
            error: "Unable to place bid."
          });
        }
        // if bidder is owner
        if (req.user.id == listing.owner.id) {
          return res
            .status(400)
            .json({ error: "You can't bid your own listing." });
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
          listing.bestBidder.save((err, saved) => {
            if (err) {
              return res.status(400).json(err);
            }
            if (listing.buyOut && req.body.bid >= listing.buyOut) {
              const tx = {
                type: req.params.type,
                buyer: req.user.id,
                seller: listing.owner.id,
                price: listing.buyOut,
                product: listing[req.params.type].id,
                listing: listing.id,
                isfinal: true
              };

              transfer(tx)
                .then(tx => {
                  return res.json({ message: "Success.", tx });
                })
                .catch(err => {
                  return res.status(400).json(err);
                });
            } else {
              const tx = {
                type: req.params.type,
                bidder: req.user.id,
                price: req.body.bid,
                listing: listing.id
              };

              bid(tx)
                .then(tx => {
                  return res.json({ message: "Success", tx });
                })
                .catch(err => {
                  return res.status(400).json(err);
                });
            }
          });
        } else {
          if (listing.buyOut && req.body.bid >= listing.buyOut) {
            req.user.balance -= req.body.buyOut;
            if (req.user.balance < 0) {
              return res
                .status(400)
                .json({ error: "You cannot afford this bid." });
            }
            const tx = {
              type: req.params.type,
              buyer: req.user.id,
              seller: listing.owner.id,
              price: listing.buyOut,
              product: listing[req.params.type].id,
              listing: listing.id,
              isfinal: true
            };

            transfer(tx)
              .then(tx => {
                return res.json({ message: "Success.", tx });
              })
              .catch(err => {
                return res.status(400).json(err);
              });
          } else {
            const tx = {
              type: req.params.type,
              bidder: req.user.id,
              price: req.body.bid,
              listing: listing.id
            };

            bid(tx)
              .then(tx => {
                return res.json({ message: "Success", tx });
              })
              .catch(err => {
                return res.status(400).json(err);
              });
          }
        }
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
      listing.save((err, saved) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.json({
          message: "Successfully edited sale.",
          listing: saved
        });
      });
    });
  }
);

// TRANSACTION
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

        console.log(listing);
        if (!listing || listing.owner.id != req.user.id) {
          return res.status(404).json({
            error: "Listing not found."
          });
        }

        if (!listing.bestBidder || !listing.bestBid) {
          return res.status(400).json({
            error: "You do not have any bids."
          });
        }

        // build a transaction
        const tx = {
          type: req.params.type,
          buyer: listing.bestBidder.id,
          seller: listing.owner.id,
          price: listing.bestBid,
          product: listing[req.params.type].id,
          listing: listing.id
        };

        transfer(tx)
          .then(tx => {
            return res.json({ message: "Success.", tx });
          })
          .catch(err => {
            return res.status(400).json(err);
          });
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
          listing.bestBidder.save((err, saved) => {
            if (err) {
              return res.status(400).json(err);
            }
            listing.remove((err, removed) => {
              if (err) {
                return res.status(400).json(err);
              }
              return res.json({ message: "Successfully removed sale." });
            });
          });
        } else {
          listing.remove((err, removed) => {
            if (err) {
              return res.status(400).json(err);
            }
            return res.json({ message: "Successfully removed sale." });
          });
        }
      });
  }
);

module.exports = router;
