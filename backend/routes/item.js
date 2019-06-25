const router = require("express").Router();

const Item = require("../models/Item");
const Market = require("../models/Market");

// GET /:id
// gets a item by id
router.get("/:id", (req, res) => {
  // if address doesn't exist, register it
  Item.findById(req.params.id)
    .populate("type owner")
    .exec((err, item) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!item) {
        return res.status(404).json({
          error: "Item not found."
        });
      }

      Market.findOne({ product: item.id }, (err, market) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.json({
          type: item.type,
          owner: item.owner,
          name: item.name
        });
      });
    });
});

module.exports = router;
