var express = require("express");
var auth = require("../auth");
var router = express.Router();
var knex = require("../db");

var debtCalculator = require("../debt_calculator");
var admin = require("firebase-admin");

var Roommates = require("../modules/roommates");
var roommates = new Roommates(knex);

var Houses = require("../modules/houses");
var houses = new Houses(knex, roommates);

var Purchases = require("../modules/purchases");
var purchases = new Purchases(knex, houses, roommates);

router.use(auth.authMiddleware);

router.post("/", async function(req, res) {
    try {
        const id = await houses.addHouse(req.body.name, res.locals.user.uid);
        res.json({id});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.delete("/:houseId", async function(req, res) {
    try {
        var rowsDeleted = await houses.deleteHouse(req.params["houseId"],
            res.locals.user.uid);
        res.json({"rows deleted": rowsDeleted});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:houseId", async function(req, res) {
    try {
        res.json(await houses.getHouse(req.params["houseId"],
            res.locals.user.uid));
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:houseId/purchases", async function(req, res) {
    try {
        var houseId = req.params["houseId"];
        
        var purchases = await knex("purchases")
            .join("roommates", "roommate_id", "=", "purchase_roommate")
            .join("houses", "house_id", "=", "roommate_house")
            .where("house_id", houseId)
            .select("purchase_id", "purchase_roommate", 
                    "purchase_amount", "purchase_memo",
                    "roommate_name");
        
        purchases = purchases.map((p) => {
            return {
                id: p.purchase_id,
                purchaser: p.purchase_roommate,
                purchaserName: p.roommate_name,
                amount: p.purchase_amount,
                memo: p.purchase_memo,
            };
        });
        purchases.reverse();
        
        res.json(purchases);
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.post("/:houseId/purchases", async function(req, res) {
    var purchaser = req.body.purchaser;
    var amount = req.body.amount;
    var memo = req.body.memo;
    var divisions = req.body.divisions;
    var houseId = req.params["houseId"];
    var uid = res.locals.user.uid;

    try {
        var id = await purchases.addPurchase(purchaser, amount, memo, divisions,
            houseId, uid);
        res.json({id});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:houseId/purchases/:purchaseId", async function(req, res) {
    try {
        res.json(await purchases.getPurchase(req.params["purchaseId"],
            req.params["houseId"], res.locals.user.uid));
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.delete("/:houseId/purchases/:purchaseId", async function(req, res) {
    var purchaseId = req.params["purchaseId"];
    var houseId = req.params["houseId"];
    var uid = res.locals.user.uid;

    try {
        var rowsDeleted = await purchases.deletePurchase(purchaseId, houseId, uid);
        res.json({"rows deleted": rowsDeleted});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.get("/:houseId/statistics/:roommateId", async function(req, res) {
    var houseId = req.params["houseId"];
    var roommateId = req.params["roommateId"];

    var allDebts = await debtCalculator.getAllDebts(knex, houseId);
    var house = await houses.getHouse(houseId, res.locals.user.uid);

    var debts = new Map();

    for (var roommate of house.roommates) {
        if (String(roommate) !== roommateId) {
            debts.set(roommate, 0);
        }
    }

    for (var debt of allDebts) {
        var amount = debt["amount"];

        if (String(debt["payer"]) === roommateId) {
            var roommate = debt["payee"].toString();
            debts.set(roommate, (debts.get(roommate) || 0) - amount);
        } else if (String(debt["payee"]) === roommateId) {
            var roommate = debt["payer"].toString();
            debts.set(roommate, (debts.get(roommate) || 0) + amount);
        }
    }

    var youOwe = 0;
    var youAreOwed = 0;

    for (const [_, debt] of debts) {
        if (debt > 0) {
            youAreOwed += debt;
        } else if (debt < 0) {
            youOwe += debt;
        }
    }

    res.json({youOwe, youAreOwed});
});

router.get("/:houseId/debts/:roommateId", async function(req, res) {
    var houseId = req.params["houseId"];
    var roommateId = req.params["roommateId"];

    var allDebts = await debtCalculator.getAllDebts(knex, houseId);
    var house = await houses.getHouse(houseId,
        res.locals.user.uid);

    var debts = {};

    for (var roommate of house.roommates) {
        if (String(roommate) !== roommateId) {
            debts[roommate] = 0;
        }
    }

    for (var debt of allDebts) {
        var amount = debt["amount"];

        if (String(debt["payer"]) === roommateId) {
            var roommate = debt["payee"].toString();
            debts[roommate] -= amount;
        } else if (String(debt["payee"]) == roommateId) {
            var roommate = debt["payer"].toString();
            debts[roommate] += amount;
        }
    }

    res.json(debts);
});

// Remove after M9
router.get("/:houseId/debts_detailed/:roommateId", async function (req, res) {
    var houseId = req.params["houseId"];
    var roommateId = req.params["roommateId"];

    var allDebts = await debtCalculator.getAllDebts(knex, houseId);
    var house = await houses.getHouse(houseId, res.locals.user.uid);

    var debts = new Map();

    for (var roommate of house.roommates) {
        if (String(roommate) !== roommateId) {
            debts[roommate] = 0;
        }
    }

    for (var debt of allDebts) {
        var amount = debt["amount"];

        if (debt["payer"] == roommateId) {
            var roommate = debt["payee"].toString();
            debts.set(roommate, (debts.get(roommate) || 0) - amount);
        } else if (debt["payee"] == roommateId) {
            var roommate = debt["payer"].toString();
            debts.set(roommate, (debts.get(roommate) || 0) + amount);
        }
    }

    var debtsSummary = [];
    for (const [id, amount] of debts) {
        var name = await knex("roommates")
            .select("roommate_name")
            .where("roommate_id", id);
        name = name[0]["roommate_name"];

        if (amount !== 0) {
            debtsSummary.push({ roommate: id, amount, roommateName: name});
        }
    }

    console.log(debtsSummary); // eslint-disable-line no-console
    res.json(debtsSummary);
});

router.get("/:houseId/debts/:userRoommateId/:otherRoommateId", async function(req, res) {
    var houseId = req.params["houseId"];

    var userRoommateId = req.params["userRoommateId"];
    var otherRoommateId = req.params["otherRoommateId"];

    var allDebts = await debtCalculator.getAllDebts(knex, houseId);

    var debts = allDebts.filter((d) => (String(d.payee) === userRoommateId &&
        String(d.payer) === otherRoommateId) || (String(d.payee) === otherRoommateId &&
        String(d.payer) === userRoommateId));

    var purchases = debts.filter((d) => d.type === "purchase")
        .map((d) => d.purchase);

    var reimbursements = debts.filter((d) => d.type === "payed back")
        .map((d) => d.youoweme);

    res.json({purchases, reimbursements});
});

module.exports = router;
