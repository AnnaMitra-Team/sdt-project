require("./setup");
const chai = require("chai");
chai.should();   // ✅ THIS ENABLES `.should`
const request = require("supertest");
const app = require("../../index");

describe("VOLUNTEER TESTS", () => {
  it("Should load volunteer dashboard", async () => {
    const res = await request(app).get("/volunteer");
    res.status.should.be.oneOf([200, 302]);
  });

  it("Should toggle availability", async () => {
    const res = await request(app).post("/volunteer/toggle-availability");
    res.status.should.be.oneOf([200, 302, 401]);
  });
});
