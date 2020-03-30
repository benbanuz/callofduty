const mocha = require("mocha");
const http = require("http");
const mongoServer = require("../../start").server;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectID;
const async = require("async");

// Connection URL
const mongoUrl = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';


describe("justice board api", function () {
  const url = "http://localhost:3000/justiceBoard";

  after("justice board api", function (doneAfter) {
    mongoServer.close();
    doneAfter();
  });

  it("should return the correct justice board when getting a get request to the url /justiceBoard", function (doneIt) {
    let soldiers = [{
      id: "8411494",
      name: "ben",
      rank: "kama",
      limitations: [],
      duties: []
    }, {
      id: "1234567",
      name: "ben",
      rank: "kama",
      limitations: [],
      duties: []
    }, {
      id: "7654321",
      name: "ben",
      rank: "kama",
      limitations: [],
      duties: []
    }];
    let dutiesId = [];
    let duties = [{
      "name": "hagnash",
      "location": "sosia",
      "days": "7",
      "constraints": ["yeshiva"],
      "soldiersRequired": "3",
      "value": "20",
      "soldiers": ["8411494", "1234567", "7654321"]
    }, {
      "name": "hagnash",
      "location": "sosia",
      "days": "7",
      "constraints": ["yeshiva"],
      "soldiersRequired": "1",
      "value": "20",
      "soldiers": ["8411494"]
    }];

    MongoClient.connect(mongoUrl, function (err, client) {
      const db = client.db(dbName);
      const soldiersCollection = db.collection('soldiers');
      const dutiesCollection = db.collection('duties');
      async.forEachOf(duties, (dutie, key, doneElement) => {
        dutiesCollection.insertOne(dutie,
          function (err, resultInsert) {
            dutiesId.push(resultInsert["insertedId"]);
            doneElement();
          });
      }, err => {
        soldiers[0]["duties"].push(dutiesId[0]);
        soldiers[0]["duties"].push(dutiesId[1]);
        soldiers[1]["duties"].push(dutiesId[0]);
        soldiers[2]["duties"].push(dutiesId[0]);
        soldiersCollection.insertMany(soldiers, function (err, resultInsert) {
          const Http = new XMLHttpRequest();
          Http.open("GET", url);
          Http.send();
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              let expectedResult = [{
                id: "8411494",
                score: 40
              }, {
                id: "1234567",
                score: 20
              }, {
                id: "7654321",
                score: 20
              }];
              expect(Http.responseText).to.eql(JSON.stringify(expectedResult));
              soldiersCollection.deleteMany({}, function (err, result) {
                dutiesCollection.deleteMany({}, function (err, result) {
                  client.close();
                  doneIt();
                });
              });
            }
          }

        });
      });
    });
  });

  it("should return the correct justice board when getting a get request to the url /justiceBoard with an empty db", function (doneIt) {
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = (e) => {
      if (Http.readyState == 4 && Http.status == 200) {
        expect(Http.responseText).to.eql("[]");
        doneIt();
      }
    }
  });

});