const app = require("express")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const user = require("./routes/user");
const hero = require("./routes/hero");
const item = require("./routes/item");

// db
const { mongoDb } = require("./config/keys.js");
mongoose.connect(mongoDb, err => {
  console.log(err || "Connected to database");
});

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use("/user", user);
app.use("/hero", hero);
app.use("/item", item);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
