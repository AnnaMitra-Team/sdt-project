require("./setup");
const chai = require("chai");
chai.should();
const request = require("supertest");
const app = require("../../index");

describe("AUTH – ADVANCED TESTS", () => {

  it("Should reject registration with missing fields", async () => {
    const res = await request(app).post("/auth/register").send({
      user: { email: "bad@test.com" }
    });

    res.status.should.be.oneOf([400, 302]);
  });

  it("Should reject duplicate email registration", async () => {
    await request(app).post("/auth/register").send({
      user: {
        email: "dup@test.com",
        password: "Test@123",
        contact: "9999999999",
        role: "Donor"
      },
      donorProfile: {
        firstName: "A",
        lastName: "B",
        address: "Addr",
        city: "A",
        state: "B",
        pincode: "380001"
      }
    });

    const res = await request(app).post("/auth/register").send({
      user: {
        email: "dup@test.com",
        password: "Test@123",
        contact: "9999999999",
        role: "Donor"
      },
      donorProfile: {
        firstName: "A",
        lastName: "B",
        address: "Addr",
        city: "A",
        state: "B",
        pincode: "380001"
      }
    });

    res.status.should.be.oneOf([400, 302]);
  });

  it("Should reject login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "donor@test.com",
      password: "WrongPassword"
    });

    res.status.should.equal(400);
  });

});
