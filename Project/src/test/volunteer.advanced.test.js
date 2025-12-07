require("./setup");
const chai = require("chai");
chai.should();
const request = require("supertest");
const app = require("../../index");

describe("VOLUNTEER – ADVANCED TESTS", () => {

  it("Should block non-volunteer from volunteer routes", async () => {
    const res = await request(app).get("/volunteer");
    res.status.should.equal(302);
  });

  it("Should prevent availability toggle without login", async () => {
    const res = await request(app).post("/volunteer/toggle-availability");
    res.status.should.equal(302);
  });

});
