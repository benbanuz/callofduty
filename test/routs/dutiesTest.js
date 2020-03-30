const mocha = require("mocha");
const http = require("http");
const mongoServer = require("../../start").server;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const mongoUrl = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

describe("duties api", function () {
  const url = 'http://localhost:3000/duties';

  after("duties api", function (doneAfter) {
    mongoServer.close();
    doneAfter();
  });

  describe("dutie POST", function () {
    it("should return a succesfull respone when the dutie has been added to the database", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "name": "hagnash",
        "location": "sosia",
        "days": "7",
        "constraints": ["yeshiva"],
        "soldiersRequired": "3",
        "value": "20"
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          MongoClient.connect(mongoUrl, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('duties');
            collection.deleteOne({
              "name": "hagnash",
              "location": "sosia",
              "days": "7",
              "constraints": ["yeshiva"],
              "soldiersRequired": "3",
              "value": "20"
            }, function (err, result) {
              client.close();
              doneIt();
            });
          });
        }
      };
    });

    it("should return an error status code when ileagal dutie json is sent to be inserted to the db", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "location": "sosia",
        "days": "7",
        "constraints": ["yeshiva"],
        "soldiersRequired": "3",
        "value": "20"
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is ileagal");
          doneIt();
        }
      };
    });
  });
});