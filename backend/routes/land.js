const router = require("express").Router();

const Land = require("../models/Land");
const LandListing = require("../models/LandListing");

// GET /:id
// gets a Land by id
router.get("/:id", (req, res) => {
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

      LandListing.findOne({ land: land.id }, (err, listing) => {
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
          listing: listing ? listing : "Not for sell."
        });
      });
    });
});

// GET /inventory/:id
// get's :id's lands
router.get("/inventory/:id", (req, res) => {
  Land.find({ owner: req.params.id }, (err, lands) => {
    if (err) {
      return res.status(400).json(err);
    }

    if (!lands.length) {
      return res.status(404).json({ error: "Nothing found." });
    }

    return res.json(lands);
  });
});
module.exports = router;
