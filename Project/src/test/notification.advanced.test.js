require("./setup");
const chai = require("chai");
chai.should();
const Notification = require("../../src/models/notification.model");
const mongoose = require("mongoose");

describe("NOTIFICATION – ADVANCED TESTS", () => {

  it("Should insert multiple notifications safely", async () => {
    const id1 = new mongoose.Types.ObjectId();
    const id2 = new mongoose.Types.ObjectId();

    const result = await Notification.insertManyIfAllowed([
      { userId: id1, title: "A", message: "A", type: "info" },
      { userId: id2, title: "B", message: "B", type: "success" }
    ]);

    result.should.be.an("array");
  });

});
