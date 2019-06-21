const router = require("express").Router();

const Hero = require("../models/Hero");
const Item = require("../models/Item");

// GET /:address/:id
// gets a hero by id
router.get("/:id", (req, res) => {
  // if address doesn't exist, register it
  Hero.findById(req.params.id)
    .populate("type owner")
    .exec((err, hero) => {
      if (err) {
        res.status(400).json(err);
      }
      if (!hero) {
        res.status(404).json({
          error: "Hero not found"
        });
      }

      Item.find({ owner: hero.owner.id, hero: hero.id }, (err, items) => {
        if (err) {
          res.status(400).json(err);
        }

        res.json({
          type: hero.type,
          owner: hero.owner,

          name: hero.name,
          experience: hero.experience,
          level: hero.level,
          units: hero.units,
          items: [...items]
        });
      });
    });
});

module.exports = router;
