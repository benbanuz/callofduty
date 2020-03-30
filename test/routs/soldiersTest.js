const mocha = require("mocha");
const http = require("http");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const configs = require('../../configFile');
const fs = require("fs");

let mongoServer;
let client;
let db;

describe("soldiers api", function () {
  const url = 'http://localhost:3000/soldiers';
  let testData = 1;

  before("soldiers api", function (done) {
    require("../../start").serverUtils.then(res => {
      mongoServer = res[0];
      client = res[1];
      db = res[2];
      const collection = db.collection('soldiers');
      collection.deleteMany({}, function (err, result) {
        fs.readFile("test/routs/soldiersTestData.JSON", function (err, data) {
          testData = JSON.parse(data);
          done();
        });
      });
    });
  });

  after("soldiers api", function (done) {
    client.close()
    mongoServer.close();
    done();
  });

  afterEach("soldiers api", function (done) {
    const collection = db.collection('soldiers');
    collection.deleteMany({}, function (err, result) {
      done();
    });
  });

  describe("soldier POST", function () {
    it("should return a succesfull respone when the soldier has been added to the database", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testSuccess"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          done();
        }
      };
    });

    it("should return an error status code when soldier json without a name is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testNoNameErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent is missing the field name");
          done();
        }
      };
    });

    it("should return an error status code when soldier json without a rank is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testNoRankErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent is missing the field rank");
          done();
        }
      };
    });

    it("should return an error status code when soldier json without a limitations is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testNoLimitations"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent is missing the field limitations");
          done();
        }
      };
    });

  });

  describe("soldier GET", function () {
    it("should return all soldiers in db when a get request is sent to the /soldiers url", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          const collection = db.collection('soldiers');
          collection.find({}).toArray(function (err, result) {
            expect(Http.responseText).to.eql(JSON.stringify(result));
            done();
          });
        }
      };
    });

    it("should return a spesific soldiers json when recieving a get request to url /soldiers/[id]", function (done) {
      const Http = new XMLHttpRequest();
      const collection = db.collection('soldiers');
      collection.insertOne(testData["getSoldierTestData"]["getById"], function (err, resultInsert) {
        Http.open("GET", url + "/" + testData["getSoldierTestData"]["getById"]["id"]);
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            collection.find({
              "id": testData["getSoldierTestData"]["getById"]["id"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result[0]));
              collection.deleteOne({
                "id": testData["getSoldierTestData"]["getById"]["id"]
              }, function (err, resultDelete) {
                done();
              });
            });
          }
        };
      });
    });

    it("should return err when getting a get request for soldier that doesnt exist", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url + testData["getSoldierTestData"]["getByIdErr"]);
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("no soldier that answers the given parameters has been found");
          done();
        }
      };
    });

    it("should return a spesific soldiers json when recieving a get request to url /soldiers?name='name'", function (done) {
      const Http = new XMLHttpRequest();
      const collection = db.collection('soldiers');
      collection.insertOne(testData["getSoldierTestData"]["getByName"], function (err, resultInsert) {
        Http.open("GET", url + "?name=" + testData["getSoldierTestData"]["getByName"]["name"]);
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            collection.find({
              "name": testData["getSoldierTestData"]["getByName"]["name"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              collection.deleteOne({
                "id": testData["getSoldierTestData"]["getByName"]["id"]
              }, function (err, resultDelete) {
                done();
              });
            });
          }
        };
      });
    });
    
  });
});