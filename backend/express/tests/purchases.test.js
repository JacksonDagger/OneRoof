const BadRequestError = require("../modules/errors/BadRequestError");
const NotFoundError = require("../modules/errors/NotFoundError");
const ForbiddenError = require("../modules/errors/ForbiddenError");

var knex = require("../db");
jest.mock("../db", () => {
    const mKnex = { 
        select: jest.fn(() => mKnex),
        from: jest.fn(() => mKnex),
        where: jest.fn(() => mKnex),
        insert: jest.fn(() => mKnex),
        into: jest.fn(() => mKnex),
        del: jest.fn(() => mKnex),
        join: jest.fn(() => mKnex),
        first: jest.fn(() => mKnex),
        update: jest.fn(() => mKnex)
    };
    return jest.fn(() => mKnex);
});

var Roommates = require("../modules/roommates");
jest.mock("../modules/roommates", () => {
    return jest.fn().mockImplementation(() => {
        return {
            checkIfUserIsInHouse: jest.fn(),
            isHouseOwnerOrSiteAdmin: jest.fn()
        };
      });
});

var roommates = new Roommates(knex);

var Houses = require("../modules/houses");
jest.mock("../modules/houses", () => {
    return jest.fn().mockImplementation(() => {
        return {
            validateHouseId: jest.fn()
        };
      });
});

var houses = new Houses(knex, roommates);

var Purchases = require("../modules/purchases");
var purchases = new Purchases(knex, houses, roommates);

afterEach(() => {
    jest.clearAllMocks();
});

test("getPurchases", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    houses.validateHouseId.mockResolvedValue(true);
    
    knex().select
        .mockResolvedValueOnce([{
                "purchase_id": 1,
                "purchase_roommate": 1,
                "roommate_name": "Maddie",
                "purchase_amount": 5000,
                "purchase_memo": "Earls",
            }, {
                "purchase_id": 2,
                "purchase_roommate": 2,
                "roommate_name": "Alyssa",
                "purchase_amount": 2000
            }
        ]);
    
    const actual = await purchases.getPurchases("valid uid", 1);
    expect(actual).toEqual([{
            id: 1,
            purchaser: 1,
            purchaserName: "Maddie",
            amount: 5000,
            memo: "Earls",
        }, {
            id: 2,
            purchaser: 2,
            purchaserName: "Alyssa",
            amount: 2000
        }
    ]);
});

test("getPurchases with invalid house id", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    houses.validateHouseId.mockResolvedValue(false);
    
    await expect(async () => await purchases.getPurchases("valid uid", 99))
        .rejects.toEqual(new NotFoundError("house id not found"));
});

test("getPurchases with invalid requester", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(false);
    houses.validateHouseId.mockResolvedValue(true);
    
    await expect(async () => await purchases.getPurchases("invalid uid", 1))
        .rejects.toEqual(new ForbiddenError("requester is not in house"));
});

test("getPurchase", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    
    knex().select
        .mockResolvedValueOnce([
            {
                "purchase_id": 1,
                "purchase_roommate": 1,
                "roommate_name": "Maddie",
                "purchase_amount": 5000,
                "purchase_memo": "Earls",
            }
        ])
        .mockResolvedValueOnce([
            {
                "division_id": 1,
                "division_amount": 3000,
                "division_memo": "Wings",
                "division_roommate_join_roommate": 1,
                "roommate_name": "Maddie"
            }, 
            {
                "division_id": 1,
                "division_amount": 3000,
                "division_memo": "Wings",
                "division_roommate_join_roommate": 2,
                "roommate_name": "Alyssa"
            }, 
            {
                "division_id": 2,
                "division_amount": 2000,
                "division_memo": "Spinach Dip",
                "division_roommate_join_roommate": 1,
                "roommate_name": "Maddie"
            }
        ]);
    
    const actual = await purchases.getPurchase(1, 1, "uid");
    expect(actual).toEqual({
        roommate: 1, 
        roommateName: "Maddie",
        amount: 5000, 
        divisions: [
            {
                amount: 3000, 
                memo: "Wings", 
                roommates: [1, 2], 
                roommateNames: ["Maddie", "Alyssa"]
            },
            {
                amount: 2000, 
                memo: "Spinach Dip", 
                roommates: [1], 
                roommateNames: ["Maddie"]
            }
        ], 
        memo: "Earls"
    });
});

test("getPurchase with invalid purchase id", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    
    knex().select
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
    
    await expect(async () => await purchases.getPurchase(99, 1, "uid"))
        .rejects.toEqual(new NotFoundError("purchase id not found"));
});

test("getPurchase with invalid requester", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(false);
    
    knex().select
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
    
    await expect(async () => await purchases.getPurchase(99, 1, "invalid uid"))
        .rejects.toEqual(new ForbiddenError("requester is not in house"));
});

test("addPurchase", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    houses.validateHouseId.mockResolvedValue(true);

    knex().insert.mockResolvedValue([1]);
    knex().select.mockResolvedValue([]);
    
    var divisions = [
        {
            amount: 3000, 
            memo: "Wings", 
            roommates: [1, 2]
        },
        {
            amount: 2000, 
            memo: "Spinach Dip", 
            roommates: [1]
        }
    ];

    const actual = await purchases.addPurchase(1, 5000, "Earls", divisions);
    expect(actual).toEqual(1);
});

test("addPurchase with invalid house id", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(true);
    houses.validateHouseId.mockResolvedValue(false);

    knex().insert.mockResolvedValue([1]);
    knex().select.mockResolvedValue([]);
    
    var divisions = [
        {
            amount: 3000, 
            memo: "Wings", 
            roommates: [1, 2]
        },
        {
            amount: 2000, 
            memo: "Spinach Dip", 
            roommates: [1]
        }
    ];

    await expect(async () => await purchases.addPurchase(99, 5000, "Earls", divisions))
        .rejects.toEqual(new NotFoundError("house id not found"));
});

test("addPurchase with invalid requester", async () => {
    roommates.checkIfUserIsInHouse.mockResolvedValue(false);
    houses.validateHouseId.mockResolvedValue(true);

    knex().insert.mockResolvedValue([1]);
    knex().select.mockResolvedValue([]);
    
    var divisions = [
        {
            amount: 3000, 
            memo: "Wings", 
            roommates: [1, 2]
        },
        {
            amount: 2000, 
            memo: "Spinach Dip", 
            roommates: [1]
        }
    ];

    await expect(async () => await purchases.addPurchase(1, 5000, "Earls", divisions))
        .rejects.toEqual(new ForbiddenError("requester is not in house"));
});

test("deletePurchase", async () => {
    roommates.isHouseOwnerOrSiteAdmin.mockResolvedValue(true);

    knex().del.mockResolvedValue(1);
    const actual = await purchases.deletePurchase(1, 1, "uid");
    expect(actual).toEqual(1);
});

test("deletePurchase with invalid purchase id", async () => {
    roommates.isHouseOwnerOrSiteAdmin.mockResolvedValue(true);

    knex().del.mockResolvedValue(0);

    await expect(async () => await purchases.deletePurchase(99, 1, "uid"))
        .rejects.toEqual(new NotFoundError("purchase id not found"));
});

test("deletePurchase with invalid requester", async () => {
    roommates.isHouseOwnerOrSiteAdmin.mockResolvedValue(false);

    knex().del.mockResolvedValue(1);

    await expect(async () => await purchases.deletePurchase(99, 1, "invalid uid"))
        .rejects.toEqual(new ForbiddenError("requester is not the admin nor a site admin"));
});

