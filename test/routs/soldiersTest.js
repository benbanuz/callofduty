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

describe("soldiers api", function () {
  const url = 'http://localhost:3000/soldiers';

  after("soldiers api", function (doneAfter) {
    mongoServer.close();
    doneAfter();
  });

  describe("soldier POST", function () {
    it("should return a succesfull respone when the soldier has been added to the database", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "id": "8145643",
        "name": "lior",
        "rank": "segen",
        "limitations": ["yeshiva"]
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          MongoClient.connect(mongoUrl, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('soldiers');
            collection.deleteOne({
              "id": "8145643"
            }, function (err, result) {
              client.close();
              doneIt();
            });
          });
        }
      };
    });

    it("should return an error status code when ileagal soldier json is sent to be inserted to the db", function (doneIt) {
      const Http = new XMLHttpRequest();
      const url = 'http://localhost:3000/soldiers';
      Http.open("POST", url);
      Http.send(JSON.stringify({
        "id": "8145643",
        "rank": "segen",
        "limitations": ["yeshiva"]
      }));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent is ileagal");
          doneIt();
        }
      };
    });
  });
});