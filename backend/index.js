const app = require("express")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const user = require("./routes/user");
const hero = require("./routes/hero");
const item = require("./routes/item");
const land = require("./routes/land");
const market = require("./routes/market");

// db
const { mongoDb } = require("./config/keys.js");
mongoose.connect(mongoDb, err => {
  console.log(err || "Connected to database");
});

// Testing
//require("./tests/dbitem");
require("./game/income");

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
require("./config/passport")(passport);

// routes
app.use("/user", user);
app.use("/hero", hero);
app.use("/item", item);
app.use("/land", land);
app.use("/market", market);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
