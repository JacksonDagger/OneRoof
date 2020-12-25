const BadRequestError = require("./errors/BadRequestError");
const ForbiddenError = require("./errors/ForbiddenError");
const NotFoundError = require("./errors/NotFoundError");   

class Roommates {
    constructor (knex) {
        this.knex = knex;
        
        this.validateRoommateId = async function (roommateId) {
            var response = await this.knex.select().table("roommates")
                .where({"roommate_id": roommateId});
            return response.length > 0;
        };
        
        this.addRoommate = async function (name) {
            if (typeof name !== "string") {
                throw new BadRequestError("name is not a string");
            }

            var id = await this.knex("roommates")
                .insert({"roommate_name": name});
            return id[0];
        };
        
        this.getRoommateId = async function (uid) {
            var response = await this.knex("roommates")
                .where("roommate_uid", uid)
                .select("roommate_id");
        
            if (response.length === 0) {
                throw new BadRequestError("uid " + uid + " not found");
            }
        
            return response[0].roommate_id;
        };
        
        this.setHouse = async function (roommateId, uid) {
            if (!(await this.validateRoommateId(roommateId))) {
                throw new BadRequestError("roommate id not found");
            }
        
            var userRoommate = await this.getRoommateFromUid(uid);
        
            if (userRoommate.permissions !== "owner") {
                throw new ForbiddenError("requester is not the house owner");
            }
        
            var rowsUpdated = await this.knex("roommates")
                .update("roommate_house", userRoommate.house)
                .where("roommate_id", roommateId);
        
            return rowsUpdated;
        };
        
        this.setHouseOfOwner = async function (uid, houseId) {
            var rowsUpdated = await this.knex("roommates")
                .update("roommate_house", houseId)
                .where("roommate_uid", uid);
        
            return rowsUpdated;
        };
        
        this.getRoommateFromUid = async function (uid) {
            var roommatesList = await this.knex("roommates")
                .where("roommate_uid", uid)
                .select();

            var roommate = roommatesList[0];
                
             if (!roommate.roommate_house) {
               return {id: roommate.roommate_id, name: roommate.roommate_name};
             }
                
            var houses_list = await this.knex("houses")
                .where("house_id", roommate.roommate_house)
                .select("house_admin");

            var house = houses_list[0];

            return {
                id: roommate.roommate_id,
                name: roommate.roommate_name,
                permissions: house.house_admin === roommate.roommate_id ? 
                    "owner" : "member",
                house: roommate.roommate_house
            };
        };
        
        this.getRoommateFromId = async function (roommateId) {
            var roommatesList = await this.knex("roommates")
                .where("roommate_id", roommateId)
                .select();
            
            if (roommatesList.length === 0) {
                throw new BadRequestError("roommate id not found");
            }

            var roommate = roommatesList[0];
        
            if (!roommate.roommate_house) {
                return {name: roommate.roommate_name};
            }
            
            var housesList = await this.knex("houses")
                .where({"house_id": roommate.roommate_house})
                .select("house_admin");
            
            var house = housesList[0];
            
            return {
                name: roommate.roommate_name,
                permissions: house.house_admin === roommate.roommate_id ? 
                    "owner" : "member",
                house: roommate.roommate_house
            };
        };
        
        this.deleteRoommate = async function (roommateId, uid) {
            var roommate = await this.getRoommateFromUid(uid);

            if (String(roommate.id) !== roommateId) {
                throw new ForbiddenError("requester is not roommate to be deleted");
            }

            var rowsDeleted = await this.knex("roommates")
                .where("roommate_id", roommateId)
                .del();

            if (rowsDeleted === 0) {
                throw new NotFoundError("roommate id not found");
            }
                
            return rowsDeleted;
        };
        
        this.checkIfUserIsInHouse = async function (uid, houseId) {
            var roommate = await this.getRoommateFromUid(uid);
            return String(roommate.house) === houseId;
        };

        this.isHouseOwnerOrSiteAdmin = async function (uid, houseId) {
            var roommate = await this.getRoommateFromUid(uid);

            return String(roommate.house) === houseId && 
                roommate.permissions === "owner";
        };
    }
}


module.exports = Roommates;
