require("./setup");
const chai = require("chai");
chai.should();
const request = require("supertest");
const app = require("../../index");

describe("NGO – ADVANCED TESTS", () => {

  it("Should block Volunteer from accessing NGO dashboard", async () => {
    const res = await request(app).get("/ngo");
    res.status.should.equal(302);
  });

  it("Should reject volunteer join with invalid NGO ID", async () => {
    const res = await request(app)
      .post("/ngo/123456/request-join");

    res.status.should.be.oneOf([400, 404, 302]);
  });

  it("Should block non-NGO from accepting volunteer request", async () => {
    const res = await request(app)
      .post("/ngo/123/requests/456/accept");

    res.status.should.equal(302);
  });

});
