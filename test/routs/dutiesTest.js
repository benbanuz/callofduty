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

  describe("dutie GET", function () {
    it("should return all duties in db when a get request is sent to the /duties url", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertMany(testData["getDutieTestData"]["getAll"], function (err, result) {
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            dutiesCollection.find({}).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              done();
            });
          }
        };
      });
    });

    it("should return a spesific dutie json when recieving a get request to url /duties/[id]", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["getDutieTestData"]["getById"], function (err, resultInsert) {
        Http.open("GET", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result[0]));
              done();
            });
          }
        };
      });
    });

    it("should return err when getting a get request for dutie that doesnt exist", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", new URL(path.join(url.toString(), testData["getDutieTestData"]["dutieIdNotExists"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("no duty that answers the given parameters has been found");
          done();
        }
      };
    });

    it("should return err when getting a get request for dutie with ileagal id", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("GET", new URL(path.join(url.toString(), testData["getDutieTestData"]["dutieIdNotLegal"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("the id that was sent is not legal, it needs to be of 24 chars in alpha-numeric");
          done();
        }
      };
    });

    it("should return a spesific duties json when recieving a get request to url /duties?name='name'", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["getDutieTestData"]["getByName"], function (err, resultInsert) {
        Http.open("GET", url + "?name=" + testData["getDutieTestData"]["getByName"]["name"]);
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            dutiesCollection.find({
              "name": testData["getDutieTestData"]["getByName"]["name"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              done();
            });
          }
        };
      });
    });

  });

  describe("dutie DELETE", function () {
    it("should delete spesific dutie json when recieving a DELETE  request to url /duties/id", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["deleteDutieTestData"]["testSuccess"], function (err, resultInsert) {
        Http.open("DELETE", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(result.length).to.eql(0);
              done();
            });
          }
        };
      });
    });

    it("should return correct response when getting a DELETE request for dutie that doesnt exist", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("DELETE", new URL(path.join(url.toString(), testData["deleteDutieTestData"]["testDutieNotExist"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          expect(Http.responseText).to.eql("the referenced dutie already deleted");
          done();
        }
      };
    });

    it("should return err when getting a DELETE with ilegal id", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("DELETE", new URL(path.join(url.toString(), testData["deleteDutieTestData"]["testIdNotLegal"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("the id that was sent is not legal, it needs to be of 24 chars in alpha-numeric");
          done();
        }
      };
    });

    it("should not delete a dutie that is already assigned when recieving a DELETE  request to url /duties/id", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["deleteDutieTestData"]["testDutyIsAssigned"], function (err, resultInsert) {
        Http.open("DELETE", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send();
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 400) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(result.length).to.eql(1);
              expect(Http.responseText).to.eql("dutie cannot be deleted beacuse its already assigned");
              done();
            });
          }
        };
      });
    });

  });

  describe("dutie PATCH", function () {

    it("should update a specific duties json when recieving a patch request to url /duties/[id]", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["updateDutieTestData"]["testSuccess"]["insertedDutie"], function (err, resultInsert) {
        Http.open("PATCH", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send(JSON.stringify(testData["updateDutieTestData"]["testSuccess"]["updateProp"]));
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 200) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(testData["updateDutieTestData"]["testSuccess"]["updateProp"]["name"]).to.eql(result[0]["name"]);
              done();
            });
          }
        };
      });
    });

    it("should return an err when recieving a patch request to the url duties/[id] to a not existing dutie", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("PATCH", new URL(path.join(url.toString(), testData["updateDutieTestData"]["dutieNotExistErr"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("the specified dutie to update does not exist");
          done();
        }
      };
    });

    it("should return an err when recieving a patch request to the url duties/[id] with ilegal id", function (done) {
      const Http = new XMLHttpRequest();
      Http.open("PATCH", new URL(path.join(url.toString(), testData["updateDutieTestData"]["ilegalIdErr"])));
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 404) {
          expect(Http.responseText).to.eql("the id that was sent is not legal, it needs to be of 24 chars in alpha-numeric");
          done();
        }
      };
    });

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] with not a valid property", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["updateDutieTestData"]["ilegalProp"]["insertedDutie"], function (err, resultInsert) {
        Http.open("PATCH", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send(JSON.stringify(testData["updateDutieTestData"]["ilegalProp"]["notValidProp"]));
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 400) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql("ileagal properties to update, only keys that can be updated are (name,location,days,constrains,soldiersRequired,value,soldiers)");
              expect(!(result[0]["notValid"])).to.eql(true);
              done();
            });
          }
        };
      });
    });

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] with _id property", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["updateDutieTestData"]["updateIdErr"]["insertedDutie"], function (err, resultInsert) {
        Http.open("PATCH", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send(JSON.stringify(testData["updateDutieTestData"]["updateIdErr"]["updatedProp"]));
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 400) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(result.length > 0).to.eql(true);
              expect(Http.responseText).to.eql("ileagal properties to update, only keys that can be updated are (name,location,days,constrains,soldiersRequired,value,soldiers)");
              done();
            });
          }
        };
      });
    });

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] to a scheduled dutie", function (done) {
      const Http = new XMLHttpRequest();
      dutiesCollection.insertOne(testData["updateDutieTestData"]["scheduledDutieErr"]["insertedDutie"], function (err, resultInsert) {
        Http.open("PATCH", new URL(path.join(url.toString(), resultInsert["insertedId"].toString())));
        Http.send(JSON.stringify(testData["updateDutieTestData"]["scheduledDutieErr"]["updatedProp"]));
        Http.onreadystatechange = (e) => {
          if (Http.readyState == 4 && Http.status == 400) {
            dutiesCollection.find({
              "_id": resultInsert["insertedId"]
            }).toArray(function (err, result) {
              expect(Http.responseText).to.eql("the specified dutie to update is already scheduled");
              expect(result[0]["name"]).to.eql(testData["updateDutieTestData"]["scheduledDutieErr"]["insertedDutie"]["name"]);
              done();
            });
          }
        };
      });
    });
  });
});