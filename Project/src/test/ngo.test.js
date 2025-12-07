require("./setup");
const chai = require("chai");
chai.should();   // ✅ THIS ENABLES `.should`
const request = require("supertest");
const app = require("../../index");

describe("NGO TESTS", () => {
  it("Should load NGO dashboard", async () => {
    const res = await request(app).get("/ngo");
    res.status.should.be.oneOf([200, 302]);
  });

  it("Should load joining requests", async () => {
    const res = await request(app).get("/ngo/joining-requests");
    res.status.should.be.oneOf([200, 302]);
  });
});
