const app = require("express")();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const user = require("./routes/user");

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

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
