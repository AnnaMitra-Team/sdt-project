require("./setup");
const chai = require("chai");
chai.should();   // ✅ THIS ENABLES `.should`
const request = require("supertest");
const app = require("../../index");
const { donorUser, donationData } = require("./sampleData");

describe("DONATION TESTS", () => {
  it("Should create a donation", async () => {
    const res = await request(app).post("/donations").send(donationData);
    res.status.should.be.oneOf([200, 302]);
  });

  it("Should get all donations", async () => {
    const res = await request(app).get("/donations");
    res.status.should.be.oneOf([200, 302]);
  });
});
