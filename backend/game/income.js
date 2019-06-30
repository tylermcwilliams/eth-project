const schedule = require("node-schedule");
const User = require("../models/User");

// pay everyone every hour on the hour
const job = schedule.scheduleJob("0 * * * *", () => {
  User.aggregate([
    {
      $addFields: {
        balance: { $add: ["$balance", "$income"] }
      }
    },
    { $out: "users" }
  ]).catch(err => {
    console.log(err);
  });
});
