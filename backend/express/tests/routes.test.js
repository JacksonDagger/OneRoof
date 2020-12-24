const request = require("supertest");
const knex = require("../db");
const app = require("../app");
const { AUTH_DISABLED } = require("../auth");

beforeAll(async () => {
    await knex.migrate.latest()
    .then(function() {
        return knex.seed.run();
    });
});

afterAll(async(done) => {
    await knex.destroy();
    done();
})

describe("Houses endpoints", () => {
    it("should create a new house", async () => {
        const res = await request(app)
            .post("/houses/")
            .send({
                name: "Test house",
                uid: "Bearer 1"
            });
        console.log(res.body);
        expect(res.body.id).toEqual(3);
    });

    it("should get a house", async () => {
        const res = await request(app)
            .get("/houses/")
            .query({"houseId": 1})
            .send();
    });

    it("should fail to get a house", async () => {
        const res = await request(app)
            .get("/houses/")
            .query({ houseId: 321})
            .send();
        expect(res.statusCode).toEqual(404);
    });
  });

describe("Index endpoints", () => {
    it("should login", async () => {
        const res = await request(app)
            .post("/login")
            .send({
                fcm: "fcm test",
            });
        expect(res.body.inviteCode).toEqual(5);
    });
});

describe("Roommates endpoints", () => {
    it("should add roommate", async () => {
        const res = await request(app)
            .post("/roommates/login")
            .send({
                name: "test roommate",
            });
    });
});

describe("Youowemes endpoints", () => {
    it("should send youoweme", async () => {
        const res = await request(app)
            .patch("/youowemes")
            .query({"youowemeId": 1})
            .send({
                payed: true
            });
    });
});