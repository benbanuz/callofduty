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

  describe("dutie GET", function () {
    it("should return all duties in db when a get request is sent to the /duties url", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url);
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 200) {
          MongoClient.connect(mongoUrl, function (err, client) {
            const db = client.db(dbName);
            const collection = db.collection('duties');
            collection.find({}).toArray(function (err, result) {
              expect(Http.responseText).to.eql(JSON.stringify(result));
              client.close();
              doneIt();
            });
          });
        }
      };
    });

    it("should return a spesific dutie json when recieving a get request to url /duties/[id]", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('duties');
        collection.insertOne({
            "name": "hagnash",
            "location": "soosia",
            "days": "7",
            "constraints": "none",
            "soldiersRequired": "2",
            "value": "10"
          },
          function (err, resultInsert) {
            Http.open("GET", url + "/" + resultInsert["insertedId"].toString());
            Http.send();
            Http.onreadystatechange = (e) => {
              if (Http.readyState == 4 && Http.status == 200) {
                collection.find({
                  "_id": resultInsert["insertedId"]
                }).toArray(function (err, result) {
                  expect(Http.responseText).to.eql(JSON.stringify(result[0]));
                  collection.deleteOne({
                    "_id": resultInsert["insertedId"]
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

    it("should return err when getting a get request for dutie that doesnt exist", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("GET", url + "/333333333333333333333333");
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("no dutie that answers the given parameters has been found");
          doneIt();
        }
      };
    });

    it("should return a spesific duties json when recieving a get request to url /duties?name='name'", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('duties');
        collection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": "none",
          "soldiersRequired": "2",
          "value": "10"
        }, function (err, resultInsert) {
          Http.open("GET", url + "?name=hagnash");
          Http.send();
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              collection.find({
                "name": "hagnash"
              }).toArray(function (err, result) {
                expect(Http.responseText).to.eql(JSON.stringify(result));
                collection.deleteOne({
                  "_id": resultInsert["insertedId"]
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

  describe("dutie DELETE", function () {
    it("should delete spesific dutie json when recieving a DELETE  request to url /duties/id", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const collection = db.collection('duties');
        collection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": "none",
          "soldiersRequired": "2",
          "value": "10",
          "soldiers": []
        }, function (err, resultInsert) {
          Http.open("DELETE", url + "/" + resultInsert["insertedId"].toString());
          Http.send();
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              collection.find({
                "_id": resultInsert["insertedId"]
              }).toArray(function (err, result) {
                expect(result.length).to.eql(0);
                if (result.length != 0) {
                  collection.deleteOne({
                    "_id": resultInsert["insertedId"]
                  }, function (err, resultDelete) {
                    client.close();
                    doneIt();
                  });
                } else {
                  client.close();
                  doneIt();
                }
              });
            }
          };
        });
      });
    });

    it("should return err when getting a DELETE request for dutie that doesnt exist", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("DELETE", url + "/333333333333333333333333");
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("dutie cannot be deleted");
          doneIt();
        }
      };
    });

  });

});