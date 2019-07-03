const router = require("express").Router();

const Item = require("../models/Item");

// GET /:id
// gets a item by id
router.get("/:id", (req, res) => {
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

      return res.json({
        type: item.type,
        owner: item.owner,
        name: item.name
      });
    });
});

// GET /inventory/:id
// get's :id's items
router.get("/inventory/:id", (req, res) => {
  Item.find({ owner: req.params.id }, (err, items) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (!items.length) {
      return res.status(404).json({ error: "Nothing found." });
    }

    return res.json(items);
  });
});

module.exports = router;
