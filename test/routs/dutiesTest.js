const mocha = require("mocha");
const http = require("http");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const configs = require('../../config');
const fs = require("fs");
const path = require("path");
const async = require("async");
const runServer = require("../../start").runServer;


describe("duties api", function () {
  const url = new URL(path.join(configs.serverUrl, 'duties'));
  before("duties api", function (done) {
    runServer(function (server, clientOut, dbOut) {
      this.mongoServer = server;
      this.client = clientOut;
      this.db = dbOut;
      this.soldiersCollection = db.collection('soldiers');
      this.dutiesCollection = db.collection('duties');

      async.parallel([
        function (callback) {
          soldiersCollection.deleteMany({}, function (err, res) {
            callback();
          });
        },
        function (callback) {
          dutiesCollection.deleteMany({}, function (err, res) {
            callback();
          });
        },
        function (callback) {
          fs.readFile("test/routs/dutiesTestData.JSON", function (err, data) {
            testData = JSON.parse(data);
            callback();
          });
        }
      ], function (err, res) {
        done();
      });

    });
  });

  after("duties api", function () {
    client.close();
    mongoServer.close();
  });

  afterEach("duties api", function (done) {
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


  describe("dutie POST", function () {
    it("should return a succesfull response when the duty has been added to the database", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testSuccess"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without name is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoNameErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field name");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without location is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoLocationErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field location");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without days is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoDaysErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field days");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without constraints is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoConstraintsErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field constraints");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without name is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoNumSoldiersErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field soldiersRequired");
          done();
        }
      };
    });

    it("should return an error status code when dutie json without value is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testNoValueErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent is missing the field value");
          done();
        }
      };
    });

    it("should return an error status code when duties json is sent with a non-array constraints field is sent to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testBadConstraintsErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The constraints field must be an Array");
          done();
        }
      };
    });

    it("should return an error status code when duties json is sent with an extra not required fields to be inserted to the db", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testExtraFieldsErr"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("The dutie json that was sent must only have the fields (name,location,days,constraints,soldierRequired,value)");
          done();
        }
      };
    });

    it("should return a succesfull response when the duty has been added to the database with a soldiers field", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("POST", url);
      Http.send(JSON.stringify(testData["insertDutieTestData"]["testSuccess"]));
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("");
          dutiesCollection.find({
            "name": testData["insertDutieTestData"]["testSuccess"]["name"]
          }).toArray(function (err, result) {
            expect("soldiers" in result[0]).to.eql(true);
            expect(Array.isArray(result[0]["soldiers"])).to.eql(true);
            done();
          });
        }
      };
    });

  });
});