var knexInitFile = require("./knexfile");
var knex;
if (process.env.NODE_ENV === "test") {
    knex = require("knex")(knexInitFile.test);
  } else {
    knex = require("knex")(knexInitFile.production);
}

module.exports = knex;

// examples:
// knex.migrate.latest()
//   .then(function() {
//     return knex.seed.run();
//   });

// knex("houses").insert({house_name: "House 2", house_admin: 3}, ["id"])
//         .then(function (house) {
//           console.log(house);
//         });

// knex.select().table("houses").then(function (houses) {
//   console.log(houses);
// });

// knex.select("roommate_name", "house_name").from("roommates")
//   .join("houses", "roommate_id", "=", "house_admin").then(function (houses) {
//   console.log(houses);
// });