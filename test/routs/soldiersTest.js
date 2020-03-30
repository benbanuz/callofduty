const mocha = require("mocha");
const http = require("http");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const configs = require('../../config');
const fs = require("fs");
const runServer = require("../../start").runServer;


describe("soldiers api", function () {
  const url = configs.serverUrl + 'soldiers';

  before("soldiers api", function (done) {
    runServer(function (server, clientOut, dbOut) {
      this.mongoServer = server;
      this.client = clientOut;
      this.db = dbOut;
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
    it("should return a succesfull response when the soldier has been added to the database", function (done) {
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

    it("should return an error status code when soldier json without an id is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testNoId"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent is missing the field id");
          done();
        }
      };
    });

    it("should return an error status code when soldier json with an ilegal id (not with 7 digits) is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testBadId"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent didnt had a legal id");
          done();
        }
      };
    });

    it("should return an error status code when soldier json with an ilegal id (had a non-numeric char) is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testBadId2"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent didnt had a legal id");
          done();
        }
      };
    });

    it("should return an error status code when soldier json is sent with a non-array limitations field is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testBadLimitations"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The limitations field must be an Array");
          done();
        }
      };
    });

    it("should return an error status code when soldier json is sent with an extra not required fields to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testExtraFields"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The soldier json that was sent must only have the fields (id,name,rank,limitations)");
          done();
        }
      };
    });

    it("should return a succesfull response when the soldier has been added to the database with a duties field", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertSoldierTestData"]["testSuccess"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          const collection = db.collection('soldiers');
          collection.find({
            "id": testData["insertSoldierTestData"]["testSuccess"]["id"]
          }).toArray(function (err, result) {
            expect("duties" in result[0]).to.eql(true);
            expect(Array.isArray(result[0]["duties"])).to.eql(true);
            done();
          });
        }
      };
    });

  });

  describe("soldier GET", function () {
    it("should return all soldiers in db when a get request is sent to the /soldiers url", function (done) {
      const Http = new XMLHttpRequest();
      const collection = db.collection('soldiers');

      collection.insertMany(testData["getSoldierTestData"]["getAll"], function (err, result) {
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            collection.find({}).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              done();
            });
          }
        };
      });
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