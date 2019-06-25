const router = require("express").Router();

const Land = require("../models/Land");
const Market = require("../models/Market");

// GET /:id
// gets a Land by id
router.get("/:id", (req, res) => {
  // if address doesn't exist, register it
  Land.findById(req.params.id)
    .populate("owner")
    .exec((err, land) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!land) {
        return res.status(404).json({
          error: "Land not found."
        });
      }

      Market.findOne({ product: land.id }, (err, market) => {
        if (err) {
          return res.status(400).json(err);
        }
        return res.json({
          type: land.type,
          owner: land.owner,
          name: land.name,
          income: land.income,
          bonus: land.bonus,
          bonusModifier: land.bonusModifier,
          buildings: [...land.buildings],
          market
        });
      });
    });
});

module.exports = router;
