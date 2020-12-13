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
        update: jest.fn(() => mKnex),
        whereIn: jest.fn(() => mKnex)
    };
    return jest.fn(() => mKnex);
});

var Roommates = require("../modules/roommates");
jest.mock("../modules/roommates", () => {
    return jest.fn().mockImplementation(() => {
        return {
            getRoommateId: jest.fn(),
            setHouseOfOwner: jest.fn(),
            getRoommateFromUid: jest.fn()
        };
      });
});

var roommates = new Roommates(knex);

var Houses = require("../modules/houses");
var houses = new Houses(knex, roommates);

test("addHouse", async () => {
    knex().insert.mockResolvedValue([1]);
    roommates.getRoommateId.mockResolvedValue(1);

    const actual = await houses.addHouse("Maddie's House");
    expect(actual).toEqual(1);
});

test("addHouse with undefined name", async () => {
    knex().insert.mockResolvedValue([1]);
    roommates.getRoommateId.mockResolvedValue(1);

    await expect(async () => await houses.addHouse(undefined))
        .rejects.toEqual(new BadRequestError("name is not a string"));
});

test("deleteHouse", async () => {
    knex().select.mockResolvedValue([{}]);
    roommates.getRoommateFromUid.mockResolvedValue({
        name: "Maddie",
        permissions: "owner",
        house: 1
    });
    knex().del.mockResolvedValue(1);

    const actual = await houses.deleteHouse("1");
    expect(actual).toEqual(1);
});

test("deleteHouse with non owner requester", async () => {
    knex().select.mockResolvedValue([{}]);
    roommates.getRoommateFromUid.mockResolvedValue({
        name: "Maddie",
        permissions: "owner",
        house: 1
    });
    knex().del.mockResolvedValue(1);

    await expect(async () => await houses.deleteHouse("2"))
        .rejects.toEqual(new ForbiddenError(
            "requester is not the house owner"));
});

test("deleteHouse with invalid house id", async () => {
    knex().select.mockResolvedValue([]);
    roommates.getRoommateFromUid.mockResolvedValue({
        name: "Maddie",
        permissions: "owner",
        house: 1
    });
    knex().del.mockResolvedValue(1);

    await expect(async () => await houses.deleteHouse("99"))
        .rejects.toEqual(new NotFoundError("house id not found"));
});

test("getHouse", async () => {
    knex().select
        .mockResolvedValueOnce([{
            "house_name": "House 1",
            "house_admin": 1
        }])
        .mockResolvedValueOnce([{
                "roommate_id": 1,
                "roommate_name": "Maddie"
            }, {
                "roommate_id": 2,
                "roommate_name": "Alyssa"
            }
        ]);
    
    const actual = await houses.getHouse("1", "valid uid");
    expect(actual).toEqual({
        id: "1",
        name: "House 1",
        admin: 1,
        roommates: [1, 2],
        roommateNames: ["Maddie", "Alyssa"]
    });
});

test("getHouse with invalid id", async () => {
    roommates.getRoommateFromUid
        .mockResolvedValueOnce({
            house: 99
        });

    knex().select
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

    await expect(async () => await houses.getHouse("99", "valid uid"))
        .rejects.toEqual(new NotFoundError("house id not found"));
});

test("getHouse with invalid requester", async () => {
    roommates.getRoommateFromUid
        .mockResolvedValueOnce({
            house: 1
        });
        
    await expect(async () => await houses.getHouse("2", "invalid uid"))
        .rejects.toEqual(new ForbiddenError(
            "requester is not in the house"));
});