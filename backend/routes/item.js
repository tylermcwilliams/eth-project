const router = require("express").Router();

const Item = require("../models/Item");

// GET /:id
// gets a item by id
router.get("/:id", (req, res) => {
  // if address doesn't exist, register it
  Item.findById(req.params.id)
    .populate("type owner")
    .exec((err, item) => {
      if (err) {
        res.status(400).json(err);
      }
      if (!item) {
        res.status(404).json({
          error: "item not found"
        });
      }

      // the items the item has will be fetched seperately
      res.json({
        type: item.type,
        owner: item.owner,

        name: item.name
      });
    });
});

module.exports = router;
