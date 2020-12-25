const BadRequestError = require("./errors/BadRequestError");
const ForbiddenError = require("./errors/ForbiddenError");
const NotFoundError = require("../modules/errors/NotFoundError");

class Houses {
    constructor (knex, roommates) {
        this.knex = knex;
        this.roommates = roommates;
        

        this.addHouse = async function (name, uid) {
            if (!(typeof name === "string")) {
                throw new BadRequestError("name is not a string");
            }
        
            var roommateId = await this.roommates.getRoommateId(uid);
            var id;
        
            try {
                var response = await knex("houses")
                    .insert({"house_name": name, "house_admin": roommateId}, ["id"]);
                id = response[0];
            } catch (error) {
                throw new Error("Failed to insert house \n" + error);
            }
        
            await this.roommates.setHouseOfOwner(uid, id);
            
            return id;
        };
        
        this.deleteHouse = async function (houseId, uid) {
            if (!(await this.validateHouseId(houseId))) {
                throw new NotFoundError("house id not found");
            }
        
            var roommate;
        
            try {
                roommate = await this.roommates.getRoommateFromUid(uid);
            } catch (error) {
                throw new BadRequestError("requester not found");
            }
        
            if (String(roommate.house) !== houseId || roommate.permissions !== "owner") {
                throw new ForbiddenError("requester is not the house owner");
            }

            var rowsDeleted;

            rowsDeleted = await knex("division_roommate_join")
                .whereIn("division_roommate_join_roommate", function() {
                    return this.from("roommates")
                        .join("houses", "house_id", "=", "roommate_house")
                        .where("house_id", houseId)
                        .select("roommate_id");
                })
                .del();

            rowsDeleted = await knex("divisions")
                .whereIn("division_purchase", function() {
                    return this.from("purchases")
                        .join("roommates", "roommate_id", "=", "purchase_roommate")
                        .join("houses", "house_id", "=", "roommate_house")
                        .where("house_id", houseId)
                        .select("purchase_id");
                })
                .del();

            rowsDeleted = await knex("purchases")
                .whereIn("purchase_roommate", function() {
                    return this.from("roommates")
                        .join("houses", "house_id", "=", "roommate_house")
                        .where("house_id", houseId)
                        .select("roommate_id");
                })
                .del();


            rowsDeleted = await knex("youowemes")
                .whereIn("youoweme_you", function() {
                    return this.from("roommates")
                        .join("houses", "house_id", "=", "roommate_house")
                        .where("house_id", houseId)
                        .select("roommate_id");
                })
                .del();

            var rowsUpdated = await knex("roommates")
                .whereIn("roommate_house", function() {
                    return this.from("houses")
                        .where("house_id", houseId)
                        .select("house_id");
                })
                .update("roommate_house", null);

        
            rowsDeleted = await knex("houses")
                .where("house_id", houseId)
                .del();
                
            return rowsDeleted;
        };
        
        this.getHouse = async function (houseId, uid) {
            var roommate;
        
            try {
                console.log(uid);
                roommate = await this.roommates.getRoommateFromUid(uid);
            } catch (error) {
                throw new BadRequestError("requester not found");
            }
        
            if (String(roommate.house) !== houseId) {
                throw new ForbiddenError("requester is not in the house");
            }

            let house = {};
            house["id"] = houseId;
        
            var houseAttributes = await this.knex("houses")
                .where("house_id", houseId)
                .select("house_name", "house_admin");
        
            if (houseAttributes.length === 0) {
                throw new NotFoundError("house id not found");
            }
        
            house["name"] = houseAttributes[0]["house_name"];
            house["admin"] = houseAttributes[0]["house_admin"];
            
            var roommates = await this.knex("roommates")
                .where("roommate_house", houseId)
                .select("roommate_id", "roommate_name");
        
            house["roommates"] = roommates.map((r) => r["roommate_id"]);
            house["roommateNames"] = roommates.map((r) => r["roommate_name"]);
            
            return house;
        };
        
        this.validateHouseId = async function (houseId) {
            var response = await this.knex("houses")
                .where({"house_id": houseId})
                .select();
            return response.length > 0;
        };
    }
}


module.exports = Houses;
