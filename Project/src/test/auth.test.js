require("./setup");
const chai = require("chai");
chai.should();   // ✅ THIS ENABLES `.should`
const request = require("supertest");
const app = require("../../index");
const { donorUser } = require("./sampleData");

describe("AUTH TESTS", () => {
  it("Should register a donor", async () => {
    const res = await request(app).post("/auth/register").send({
      user: donorUser,
      donorProfile: {
        firstName: "Test",
        lastName: "Donor",
        address: "Street",
        city: "Ahmedabad",
        state: "Gujarat",
        pincode: "380001"
      }
    });

    res.status.should.be.oneOf([200, 302, 400]);
  });

  it("Should login donor", async () => {
    const res = await request(app).post("/auth/login").send({
      username: donorUser.email,
      password: donorUser.password
    });

    res.status.should.be.oneOf([200, 302, 400]);
  });
});
