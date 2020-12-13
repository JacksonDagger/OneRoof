var express = require("express");
var auth = require("../auth");
const knex = require("../db");
var router = express.Router();
var budgetCalculator = require("../budget");
var Roommates = require("../modules/roommates");
var roommates = new Roommates(knex);

router.use(auth.authMiddleware);

router.post("/", async function(req, res) {
    try {
        var id = await roommates.addRoommate(req.body.name);
        res.json({id});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:roommateId", async function(req, res) {
    try {
        res.json(await roommates.getRoommateFromId(req.params["roommateId"]));
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.delete("/:roommateId", async function(req, res) {
    try {
        var rowsDeleted = await roommates.deleteRoommate(req.params["roommateId"],
            res.locals.user.uid);
        res.json({"rows deleted": rowsDeleted});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.patch("/sethouse", async function(req, res) {
    const roommateId = req.body.inviteCode;

    try {
        var rowUpdated = await roommates.setHouse(roommateId, res.locals.user.uid);
        res.json({"rows updated": rowUpdated});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.post("/:roommateId/budget", async function (req, res) {
    const roommateId = req.params["roommateId"];
    const budget = req.body.limit;
    try {
        await knex("roommates")
        .update("roommate_budget", budget)
        .where("roommate_id", roommateId);
        res.sendStatus(200);
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.patch("/:roommateId/budget", async function (req, res) {
    const roommateId = req.params["roommateId"];
    const budget = req.body.limit;
    try {
        const count = await knex("roommates")
        .update("roommate_budget", budget)
        .where("roommate_id", roommateId);
        res.sendStatus(200);
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:roommateId/budget", async function(req, res) {
    var roommateId = req.params["roommateId"];
    var result = await budgetCalculator.budgetPrediction(roommateId);
    console.log(result); // eslint-disable-line no-console

    res.json(result);
});

module.exports = router;
