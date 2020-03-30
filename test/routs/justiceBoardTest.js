const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const configs = require('../../config');
const fs = require("fs");
const runServer = require("../../start").runServer;
const async = require("async");
const path = require("path");

describe("justice board api", function () {
  const url = new URL(path.join(configs.serverUrl, "justiceBoard"));;

  before("justice board api", function (done) {
    runServer(function (server, clientOut, dbOut) {
      this.mongoServer = server;
      this.client = clientOut;
      this.db = dbOut;
      this.soldiersCollection = db.collection('soldiers');
      this.dutiesCollection = db.collection('duties');
      async.parallel([
        function (callback) {
          soldiersCollection.deleteMany({}, function (err, result) {
            callback();
          });
        },
        function (callback) {
          dutiesCollection.deleteMany({}, function (err, result) {
            callback();
          });
        },
        function (callback) {
          fs.readFile("test/routs/justiceBoardTestData.JSON", function (err, data) {
            testData = JSON.parse(data);
            callback();
          });
        }
      ], function (err, res) {
        done();
      });

    });
  });

  afterEach("justice board api", function (done) {
    async.parallel([
      function (callback) {
        soldiersCollection.deleteMany({}, function (err, result) {
          callback();
        });
      },
      function (callback) {
        dutiesCollection.deleteMany({}, function (err, result) {
          callback();
        });
      }
    ], function (err, res) {
      done();
    });
  });

  after("justice board api", function () {
    client.close();
    mongoServer.close();
  });

  it("should return the correct justice board when getting a get request to the url /justiceBoard", function (done) {
    let soldiers = testData["getCorrectJusticeBoard"]["soldiers"];
    let dutiesId = [];
    let duties = testData["getCorrectJusticeBoard"]["duties"];

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
            let expectedResult = testData["getCorrectJusticeBoard"]["expectedResult"];
            let compfunc = (a, b) => {
              return Number(a["id"]) - Number(b["id"]);
            };
            expect(JSON.stringify(JSON.parse(Http.responseText).sort(compfunc))).to.eql(JSON.stringify(expectedResult.sort(compfunc)));
            done();
          }
        }
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