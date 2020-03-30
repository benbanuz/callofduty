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

  describe("soldier GET", function () {
    it("should return all soldiers in db when a get request is sent to the /soldiers url", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          MongoClient.connect(mongoUrl, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('soldiers');
            collection.find({}).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              client.close();
              doneIt();
            });
          });
        }
      };
    });

    it("should return a spesific soldiers json when recieving a get request to url /soldiers/[id]", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('soldiers');
        collection.insertOne({
          "id": "8145643",
          "name": "john",
          "rank": "segen",
          "limitations": ["yeshiva"]
        }, function (err, resultInsert) {
          Http.open("GET", url + "/8145643");
          Http.send();
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              collection.find({
                "id": "8145643"
              }).toArray(function (err, result) {
                expect(Http.responseText).to.eql(JSON.stringify(result[0]));
                collection.deleteOne({
                  "id": "8145643"
                }, function (err, resultDelete) {
                  client.close();
                  doneIt();
                });
              });
            }
          };
        });
      });
    });

    it("should return err when getting a get request for soldier that doesnt exist", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url + "/3333333");
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("no soldier that answers the given parameters has been found");
          doneIt();
        }
      };
    });

    it("should return a spesific soldiers json when recieving a get request to url /soldiers?name='name'", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('soldiers');
        collection.insertOne({
          "id": "8145643",
          "name": "john",
          "rank": "segen",
          "limitations": ["yeshiva"]
        }, function (err, resultInsert) {
          Http.open("GET", url + "?name=john");
          Http.send();
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              collection.find({
                "name": "john"
              }).toArray(function (err, result) {
                expect(Http.responseText).to.eql(JSON.stringify(result));
                collection.deleteOne({
                  "id": "8145643"
                }, function (err, resultDelete) {
                  client.close();
                  doneIt();
                });
              });
            }
          };
        });
      });
    });
  });
});