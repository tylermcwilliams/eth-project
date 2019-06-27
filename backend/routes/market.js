const router = require("express").Router();
const passport = require("passport");

const Market = require("../models/Market");
const Hero = require("../models/Hero");
const Item = require("../models/Item");
const Land = require("../models/Land");
const User = require("../models/User");

// GET /all
// the entire market
router.get("/all", (req, res) => {
  Market.find({})
    .populate("product owner")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!products) {
        return res.status(404).json({
          error: "Market is empty."
        });
      }
      return res.json({
        products: [...products]
      });
    });
});

// GET /:id
// get individual product for sale
router.get("/:id", (req, res) => {
  Market.findById(req.params.id)
    .populate("product owner")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!product) {
        return res.status(404).json({
          error: "Item not found."
        });
      }
      return res.json({
        product: product.product,
        owner: product.owner,
        buyOut: product.buyOut,
        bestBid: product.bestBid
      });
    });
});

// POST /sell
// sets up individual product for sale
router.post(
  "/sell",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // Verify the validity of body
    if (req.body.buyOut <= 0) {
      return res.status(400).json({
        error: "Buy out price cannot be less than or equal to zero."
      });
    }

    let schema;
    switch (req.body.type) {
      case 0:
        schema = Hero;
        break;
      case 1:
        schema = Item;
        break;
      case 2:
        schema = Land;
        break;
      default:
        return res.status(400).json({
          error: "Invalid type."
        });
    }
    schema.findOne(
      { owner: req.user.address, id: req.body.id },
      (err, product) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!product) {
          return res.status(400).json({
            error: "You cannot sell this item."
          });
        }
        // check if it's already on the market
        Market.find({ product: product.id }, (err, onMarket) => {
          if (err) {
            return res.status(400).json(err);
          }
          if (onMarket) {
            return res.status(400).json({
              error: "This is already for sell."
            });
          }

          const newOrder = new Market({
            product: product._id,
            owner: req.user.id,
            buyOut: product.buyOut
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
router.post(
  "/buy/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Market.findById(req.params.id)
      .populate("owner bestBidder")
      .exec((err, product) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!product || product.bestBid > req.body.offer) {
          return res.status(404).json({
            error: "Unable to place bid."
          });
        }

        let schema;
        switch (product.type) {
          case 0:
            schema = Hero;
            break;
          case 1:
            schema = Item;
            break;
          case 2:
            schema = Land;
            break;
          default:
            return res.status(400).json({
              error: "Invalid type."
            });
        }

        schema
          .findById(product.product)
          .populate("type")
          .exec((err, item) => {
            if (err) {
              return res.status(400).json(err);
            }
            if (!item) {
              return res.status(404).json({
                error: "Item not found."
              });
            }
            // return money to best bidder. If it got this far, the new bid is higher
            product.bestBidder.balance += product.bestBid;
            product.bestBidder.save();
            // buyout else bid
            if (req.body.offer >= product.buyOut) {
              product.owner.balance += product.buyOut;
              req.user.balance -= req.body.offer;
              item.owner = req.user._id;
              item.save();
              product.owner.save();
              product.remove();
            } else {
              product.bestBid = req.body.offer;
              product.bestBidder = req.user._id;
              req.user.balance -= req.body.offer;
              product.save();
            }
            req.user.save();
            return res.json({ message: "Successfully placed bid." });
          });
      });
  }
);

// POST /accept/:id
// accepts the highest bid
router.post(
  "/accept/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Market.findById(req.params.id)
      .populate("product owner bestBidder")
      .exec((err, product) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!product || product.owner.id != req.user.id) {
          res.status(404).json({
            error: "Product not found."
          });
        }
        req.user.balance += product.bestBid;
        product.owner = req.user.id;
        item.save();
        req.user.save();
        product.remove();

        return res.json({ message: "Successfully accepted bid." });
      });
  }
);

// POST /edit/:id
// edits individual product for sale
router.post(
  "/edit/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Market.findById(req.params.id, (err, product) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!product || product.owner != req.user.id) {
        return res.status(404).json({
          error: "Product not found."
        });
      }

      // if the new price is less than highest bid, return
      if (product.bestBid > req.body.offer) {
        return res.status(400).json({
          error: "Cannot post offer less than highest bid!"
        });
      }

      product.buyOut = req.body.offer;
      product.save();

      return res.json({ message: "Successfully edited sale." });
    });
  }
);

// DELETE /delete/:id
// deletes individual product for sale
router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Market.findById(req.params.id)
      .populate("bestBidder")
      .exec((err, product) => {
        if (err) {
          return res.status(400).json(err);
        }
        if (!product || product.owner != req.user.id) {
          return res.status(404).json({
            error: "Product not found."
          });
        }

        product.bestBidder.balance += product.bestBid;
        product.bestBidder.save();
        product.remove();

        return res.json({ message: "Successfully removed sale." });
      });
  }
);

module.exports = router;
