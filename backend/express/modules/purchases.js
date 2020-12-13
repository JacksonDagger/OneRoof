const BadRequestError = require("./errors/BadRequestError");
const ForbiddenError = require("./errors/ForbiddenError");
var admin = require("firebase-admin");
const NotFoundError = require("../modules/errors/NotFoundError");

var lodash = require("lodash");

class Purchases {
    constructor (knex, houses, roommates) {
        this.knex = knex;
        this.houses = houses;
        this.roommates = roommates;
        
        this.getPurchases = async function (uid, houseId) {
            if (!(await this.houses.validateHouseId(houseId))) {
                throw new NotFoundError("house id not found");
            }
        
            if (!(await this.roommates.checkIfUserIsInHouse(uid, houseId))) {
                throw new ForbiddenError("requester is not in house");
            }
        
            var purchases = await this.knex("purchases")
                .join("roommates", "roommate_id", "=", "purchase_roommate")
                .join("houses", "house_id", "=", "roommate_house")
                .where("house_id", houseId)
                .select("purchase_id", "purchase_roommate", 
                        "purchase_amount", "purchase_memo",
                        "roommate_name");
        
            return purchases.map((p) => {
                return {
                    id: p.purchase_id,
                    purchaser: p.purchase_roommate,
                    purchaserName: p.roommate_name,
                    amount: p.purchase_amount,
                    memo: p.purchase_memo,
                };
            });
        
        };
        
        this.getPurchase = async function (purchaseId, houseId, uid) {
            if (!(await this.roommates.checkIfUserIsInHouse(uid, houseId))) {
                throw new ForbiddenError("requester is not in house");
            }

            var purchase = await this.knex("purchases")
                .join("roommates", "purchase_roommate", "=", "roommate_id")
                .where("purchase_id", purchaseId)
                .select("purchase_roommate", "purchase_amount", 
                    "purchase_memo", "roommate_name");

            if (purchase.length === 0) {
                throw new NotFoundError("purchase id not found");
            }
        
            var divisions = await this.knex("divisions")
                .join("division_roommate_join", "division_roommate_join_division", 
                    "=", "division_id")
                .join("roommates", "division_roommate_join_roommate", "=", "roommate_id")
                .where("division_purchase", purchaseId)
                .select("division_id", "division_amount", "division_memo", 
                    "division_roommate_join_roommate", "roommate_name");
        
            var groupedDivisions = lodash.groupBy(divisions, "division_id");
            
            var divisionsList = new Array();
            for (const [_, group] of Object.entries(groupedDivisions)) {
                var roommates = new Array();

                for (var roommate of group) {
                    roommates.push(roommate["division_roommate_join_roommate"]);
                }
    
                var roommateNames = group.map((d) => d.roommate_name);
                divisionsList.push({amount: group[0]["division_amount"], 
                    memo: group[0]["division_memo"], roommates, roommateNames});
            }
        
            return { roommate: purchase[0]["purchase_roommate"], 
                roommateName: purchase[0]["roommate_name"],
                amount: purchase[0]["purchase_amount"], 
                divisions: divisionsList, 
                memo: purchase[0]["purchase_memo"] };
        };
        
        this.addPurchase = async function (purchaser, amount, memo, 
                divisions, houseId, uid) {

            if (!(await this.houses.validateHouseId(houseId))) {
                throw new NotFoundError("house id not found");
            }

            if (!(await this.roommates.checkIfUserIsInHouse(uid, houseId))) {
                throw new ForbiddenError("requester is not in house");
            }

            var purchaseId = await this.knex("purchases")
                .insert({"purchase_amount": amount, 
                "purchase_memo": memo, "purchase_roommate": purchaser});
        
            var allRoommates = new Set();
            for (var division of divisions) {
                var divisionAmount = division["amount"];
                var divisionMemo = division["memo"];
                var roommates = division["roommates"];
        
                roommates.forEach((r) => allRoommates.add(r));
        
                var divisionId = await this.knex("divisions")
                    .insert({"division_purchase": purchaseId, 
                        "division_amount": divisionAmount,
                        "division_memo": divisionMemo});
        
                for (var roommateId of roommates) {
                    await this.knex("division_roommate_join")
                        .insert({"division_roommate_join_division": divisionId[0],
                        "division_roommate_join_roommate": roommateId});
                }
            }
        
            var purchaserName = await this.knex("roommates")
                .where("roommate_id", purchaser)
                .first();
        
            var tokens = [];
            for (var mentioned of allRoommates) {
                var fcmToken = await this.knex("tokens")
                    .where("roommate_id", mentioned)
                    .select("token");
                // console.log(fcmToken);
                for (var token of fcmToken) {
                    tokens.push(token.token);
                }
            }
        
            const message = {
                notification: {
                    title: `Purchase by ${purchaserName.roommate_name} ($${Math.floor(amount / 100)}.${amount % 100})`,
                    body: `You share the cost of this purchase: ${memo}`
                },
                tokens,
              };
            
            if (tokens.length > 0) {
                let result = await admin.messaging().sendMulticast(message);
                // console.log(result);
            }
            
            return purchaseId[0];
        };
        
        this.deletePurchase = async function (purchaseId, houseId, uid) {
            if (!(await this.roommates.isHouseOwnerOrSiteAdmin(uid, houseId))) {
                throw new ForbiddenError("requester is not the admin nor a site admin");
            }

            var rowsDeleted = await this.knex("purchases")
                .where("purchase_id", purchaseId)
                .del();

            if (rowsDeleted === 0) {
                throw new NotFoundError("purchase id not found");
            }
                
            return rowsDeleted;
        };
    }
}


module.exports = Purchases;
