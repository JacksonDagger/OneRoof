var express = require("express");
var router = express.Router();
const knex = require("../db");
var auth = require("../auth");

router.get("/version", function (req, res) {
    res.send({version: "0.4.3"});
});

router.use("/login", auth.authMiddleware);
router.post("/login", async function(req, res) {
  var fcm = req.body.fcm;
  var uid = res.locals.user.uid;

  var roommate = await knex.select("roommate_id", "roommate_name", "roommate_house")
        .from("roommates")
        .where("roommate_uid", uid);

  var roommateId;
  var roommateName;
  var existingFCM;
  var roommateHouse;

  if (roommate.length === 0){
    roommateId = await knex("roommates")
        .insert({"roommate_name": res.locals.user.name, "roommate_uid": uid, "roommate_house": null, "roommate_budget": 1000});
    roommateId = roommateId[0];
    roommateName = res.locals.user.name;
  }
  else {
    roommateId = roommate[0]["roommate_id"];
    roommateName = roommate[0]["roommate_name"];
    roommateHouse = roommate[0]["roommate_house"];
  }
  existingFCM = await knex("tokens")
        .select("token")
        .where("token", fcm);

  if (existingFCM.length === 0) {
    await knex("tokens")
        .insert({"token": fcm, "roommate_id": roommateId});
  }
  
  console.log("Name: " + roommateName); // eslint-disable-line no-console
  
  var house = await knex("houses")
    //.where("house_id", roommateHouse)
    .where("house_id", roommateHouse || -1)
    .select("house_admin");

  var admin = house.length > 0 ? house[0].house_admin : null;

  var r = {roommateId, name: roommateName, inviteCode: roommateId, houseId: roommateHouse, admin};
  console.log(r); // eslint-disable-line no-console
  res.json(r);
});

// Remove after M9?
router.post("/payment", async function (req, res) {
  var d = {
    "youoweme_me": req.body.me,
    "youoweme_you": req.body.you,
    "youoweme_create_date": new Date(),
    "youoweme_payed": true,
    "youoweme_amount": req.body.amount,
  };
  console.log(d); // eslint-disable-line no-console
  await knex("youowemes")
    .insert(d);
  res.sendStatus(200);
});

router.get("/", function(req, res, next) {
  res.send("Welcome to the One Roof API!");
});

module.exports = router;
