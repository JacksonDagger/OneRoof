var express = require("express");
var router = express.Router();
const knex = require("../db");
var auth = require("../auth");

router.get("/version", function (req, res) {
    res.send({version: "0.3.1"});
});

router.use("/login", auth.authMiddleware);
router.post("/login", async function(req, res) {
  var fcm = req.body.fcm;
  var uid = res.locals.user.uid;

  var roommate = await knex.select("roommate_id", "roommate_name")
        .from("roommates")
        .where("roommate_uid", uid);

  var roommateID;
  var roommateName;

  if (roommate.length === 0){
    roommateID = await knex("roommates")
        .insert({"roommate_name": res.locals.user.name, "roommate_uid": uid, "roommate_house": 1, "roommate_budget": 10000});
    roommateName = res.locals.user.name;
    await knex("budgets")
      .insert({"budget_roommate": roommateID, "budget_goal": 1000});
  }
  else {
    roommateID = roommate[0]["roommate_id"];
    roommateName = roommate[0]["roommate_name"];
  }
  await knex("tokens")
        .insert({"token": fcm, "roommate_id": roommateID});

  console.log("Name: " + roommateName);

  res.json({"id": roommateID, "name": roommateName});
});

router.get("/", function(req, res, next) {
  res.send("Welcome to the One Roof API!");
});

router.post("/receipt-ocr", function(req, res) {
  res.send("Upload receipt and return total");
})

module.exports = router;
