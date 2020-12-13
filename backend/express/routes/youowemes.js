var express = require("express");
var auth = require("../auth");
var router = express.Router();
var admin = require("firebase-admin");
const knex = require("../db");

router.use(auth.authMiddleware);

router.post("/", async function(req, res) {
    const memo = req.body.memo;
    const target = req.body.target;
    const amount = req.body.amount;
    const status = req.body.status;
    const topic = "youoweme";

    const registrationTokens = await knex.select("token")
        .from("tokens")
        .where("roommate_id", target);

    const message = {
        notification:{
            title:"youoweme",
            body: memo
        },
        tokens: registrationTokens,
        topic
    };

    var id;

    try {
        if (status === true){
            id = await knex("youowemes")
                .insert({"youoweme_you": target,
                    "youoweme_me": 0,
                    "youoweme_amount": amount,
                    "youoweme_create_date": new Date(),
                    "youoweme_payed": true
                });
        }
        else {
            var id = await knex("youowemes")
                .insert({"youoweme_you": target,
                    "youoweme_me": 0,
                    "youoweme_amount": amount,
                    "youoweme_create_date": new Date()
                });
        }
        admin.messaging().sendMulticast(message)
        .then((response) => {
            console.log(response.successCount + " messages were sent successfully"); // eslint-disable-line no-console
        });
        res.json({id: id[0]});
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.patch("/:youowemeId", async function(req, res) {
    const youowemeid = req.params["youowemeId"];
    const payed = req.body.payed;
    try {
        await knex("youowemes")
        .update("youoweme_payed", payed)
        .where("youoweme_id", youowemeid);
        res.status(200);
    } catch (error) {
        console.log(error); // eslint-disable-line no-console
        res.status(error.status || 500).send(error.message);
    }
});

router.delete("/:youowemeId", function(req, res) {
    res.send("Delete youoweme " + req.params["youowemeId"]);
});

module.exports = router;