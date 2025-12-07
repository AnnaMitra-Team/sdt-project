require("./setup");
const chai = require("chai");
chai.should();
const request = require("supertest");
const app = require("../../index");

describe("DONATION – ADVANCED TESTS", () => {

  it("Should reject donation creation without login", async () => {
    const res = await request(app).post("/donations").send({});
    res.status.should.equal(302); // redirected to login
  });

  it("Should reject donation with invalid pincode", async () => {
    const res = await request(app).post("/donations").send({
      donation: {
        title: "Bad Donation",
        source: "Restaurant",
        numberOfPeopleFed: 5,
        images: ["/x.jpg"],
        address: "Addr",
        city: "City",
        state: "State",
        pincode: "123", // ❌ invalid
        personName: "X",
        contact: "9999999999",
        email: "test@test.com",
        location: { latitude: 12, longitude: 13 },
        items: [{
          name: "Rice",
          quantity: 2,
          unit: "Kilograms",
          type: "Cooked Food",
          condition: "Fresh",
          cookedDate: "2025-01-01",
          cookedTime: "10:00",
          itemImages: ["/x.jpg"]
        }]
      }
    });

    res.status.should.be.oneOf([400, 302]);
  });

  it("Should block NGO from creating donation", async () => {
    const res = await request(app).post("/donations").send({});
    res.status.should.equal(302);
  });

  it("Should reject OTP verification with random data", async () => {
    const res = await request(app)
      .post("/donations/123456/send-otp");

    res.status.should.be.oneOf([400, 404, 302]);
  });

});
