const BadRequestError = require("./errors/BadRequestError");

var knex = require("../db");
// var houses = require("./houses");

var roommates = roommates || {};

roommates.validateRoommateId = async function (roommateId) {
    var response = await knex.select().table("roommates")
        .where({roommate_id: roommateId});
    return response.length > 0;
}

roommates.getRoommateId = async function (uid) {
    var response = await knex.select("roommate_id")
        .from("roommates")
        .where("roommate_uid", uid);
    return response[0].roommate_id;
}

roommates.setHouse = async function (roommateId, houseId) {
    if (!(await this.validateRoommateId(roommateId))) {
        throw new BadRequestError("roommate id not found");
    }

    // if (!(await houses.validateHouseId(houseId))) {
    //     throw new Error("house id not found");
    // }

    var response = await knex("roommates")
        .update("roommate_house", houseId)
        .where("roommate_id", roommateId);
    console.log(response);
}

roommates.getRoommateFromUid = async function (uid) {
    var roommatesList = await knex.select()
        .table("roommates")
        .where("roommate_uid", uid);

    var roommate = roommatesList[0];
    
    var housesList = await knex.select("house_admin")
        .from("houses")
        .where("house_id", roommate.roommate_house);
    
    var house = housesList[0];
    
    return {
        name: roommate.roommate_name,
        permissions: house.house_admin === roommate.roommate_id ? 
            "owner" : "member",
        house: roommate.roommate_house
    };
}

module.exports = roommates;