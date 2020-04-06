const mocha = require("mocha");
const http = require("http");
const mongoServer = require("../../start").server;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const expect = require('chai').expect;
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectID;

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

  describe("dutie PATCH", function () {

    it("should update a spesific duties json when recieving a patch request to url /duties/[id]", function (doneIt) {
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
          Http.open("PATCH", url + "/" + resultInsert["insertedId"].toString());
          Http.send(JSON.stringify({
            "name": "haha i changed the name",
          }));
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 200) {
              collection.find({
                "_id": resultInsert["insertedId"]
              }).toArray(function (err, result) {
                expect("haha i changed the name").to.eql(result[0]["name"]);
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

    it("should return an err when recieving a patch request to the url duties/[id] to a not existing dutie", function (doneIt) {
      const Http = new XMLHttpRequest();
      Http.open("PATCH", url + "/333333333333333333333333");
      Http.send();
      Http.onreadystatechange = (e) => {
        if (Http.readyState == 4 && Http.status == 400) {
          expect(Http.responseText).to.eql("dutie cannot be updated");
          doneIt();
        }
      };
    });

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] with not a valid property", function (doneIt) {
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
          Http.open("PATCH", url + "/" + resultInsert["insertedId"].toString());
          Http.send(JSON.stringify({
            "notValid": "haha cant change the name",
          }));
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 400) {
              collection.find({
                "_id": resultInsert["insertedId"]
              }).toArray(function (err, result) {
                expect(Http.responseText).to.eql("ileagal properties to update");
                expect(!(result[0]["notValid"])).to.eql(true);
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

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] with _id property", function (doneIt) {
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
          Http.open("PATCH", url + "/" + resultInsert["insertedId"].toString());
          Http.send(JSON.stringify({
            "_id": "333333333333333333333333",
          }));
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 400) {
              collection.find({
                "_id": resultInsert["insertedId"]
              }).toArray(function (err, result) {
                expect(result.length > 0).to.eql(true);
                expect(Http.responseText).to.eql("ileagal properties to update");
                let idToDelete = resultInsert["insertedId"];
                if (result.length == 0) {
                  idToDelete = ObjectId("333333333333333333333333");
                }
                collection.deleteOne({
                  "_id": idToDelete
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

    it("should return an err and not update the dutie json when recieving a patch request to the url duties/[id] to a scheduled dutie", function (doneIt) {
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
          "soldiers": ["8411494"]
        }, function (err, resultInsert) {
          Http.open("PATCH", url + "/" + resultInsert["insertedId"].toString());
          Http.send(JSON.stringify({
            "name": "haha cant change the name",
          }));
          Http.onreadystatechange = (e) => {
            if (Http.readyState == 4 && Http.status == 400) {
              collection.find({
                "_id": resultInsert["insertedId"]
              }).toArray(function (err, result) {
                expect(Http.responseText).to.eql("dutie cannot be updated");
                expect(result[0]["name"]).to.eql("hagnash");
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

  describe("dutie PUT", function () {
    it("should schedule a soldier to a dutie when recieving a PUT request to the url /duties/[id]/schedule", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const dutiesCollection = db.collection('duties');
        const soldiersCollection = db.collection('soldiers');
        dutiesCollection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": [],
          "soldiersRequired": "2",
          "value": "10",
          "soldiers": []
        }, function (err, resultInsert) {
          soldiersCollection.insertMany([{
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
          }], function (err, result) {
            Http.open("PUT", url + "/" + resultInsert["insertedId"].toString() + "/schedule");
            Http.send();
            Http.onreadystatechange = (e) => {
              if (Http.readyState == 4 && Http.status == 200) {
                soldiersCollection.find({}).toArray(function (err, findRes) {
                  expect(findRes[0]["duties"][0].toString()).to.eql(resultInsert["insertedId"].toString());
                  expect(findRes[1]["duties"][0].toString()).to.eql(resultInsert["insertedId"].toString());
                  dutiesCollection.find({}).toArray(function (err, dutiesFindRes) {
                    expect(dutiesFindRes[0]["soldiers"].includes("8411494")).to.eql(true);
                    expect(dutiesFindRes[0]["soldiers"].includes("1234567")).to.eql(true);
                    soldiersCollection.deleteMany({}, function (err, result) {
                      dutiesCollection.deleteMany({}, function (err, result) {
                        client.close();
                        doneIt();
                      });
                    });
                  });
                });
              }
            };
          });
        });
      });
    });

    it("should schedule a soldier with less score to a dutie when recieving a PUT request to the url /duties/[id]/schedule", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const dutiesCollection = db.collection('duties');
        const soldiersCollection = db.collection('soldiers');
        dutiesCollection.insertMany([{
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": [],
          "soldiersRequired": "1",
          "value": "10",
          "soldiers": ["8411494"]
        }, {
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": [],
          "soldiersRequired": "1",
          "value": "10",
          "soldiers": []
        }], function (err, resultInsert) {
          soldiersCollection.insertMany([{
            id: "8411494",
            name: "ben",
            rank: "kama",
            limitations: [],
            duties: [resultInsert["insertedIds"]['0']]
          }, {
            id: "1234567",
            name: "ben",
            rank: "kama",
            limitations: [],
            duties: []
          }], function (err, result) {
            Http.open("PUT", url + "/" + resultInsert["insertedIds"]['1'].toString() + "/schedule");
            Http.send();
            Http.onreadystatechange = (e) => {
              if (Http.readyState == 4 && Http.status == 200) {
                soldiersCollection.find({}).toArray(function (err, findRes) {
                  expect(findRes[0]["duties"].length).to.eql(1);
                  expect(findRes[1]["duties"].length).to.eql(1);
                  expect(findRes[1]["duties"][0].toString()).to.eql(resultInsert["insertedIds"]['1'].toString());
                  soldiersCollection.deleteMany({}, function (err, result) {
                    dutiesCollection.deleteMany({}, function (err, result) {
                      client.close();
                      doneIt();
                    });
                  });
                });
              }
            };
          });
        });
      });
    });

    it("should not schedule a soldier with limitations to a dutie that has them in constraints when recieving a PUT request to the url /duties/[id]/schedule", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const dutiesCollection = db.collection('duties');
        const soldiersCollection = db.collection('soldiers');
        dutiesCollection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": ["yeshiva"],
          "soldiersRequired": "2",
          "value": "10",
          "soldiers": []
        }, function (err, resultInsert) {
          soldiersCollection.insertMany([{
            "id": "8411494",
            "name": "ben",
            "rank": "kama",
            "limitations": ["yeshiva"],
            "duties": []
          }, {
            "id": "1234567",
            "name": "ben",
            "rank": "kama",
            "limitations": [],
            "duties": []
          }], function (err, result) {
            Http.open("PUT", url + "/" + resultInsert["insertedId"].toString() + "/schedule");
            Http.send();
            Http.onreadystatechange = (e) => {
              if (Http.readyState == 4 && Http.status == 200) {
                soldiersCollection.find({}).toArray(function (err, findRes) {
                  expect(findRes[0]["duties"].length).to.eql(0);
                  expect(findRes[1]["duties"][0].toString()).to.eql(resultInsert["insertedId"].toString());
                  soldiersCollection.deleteMany({}, function (err, result) {
                    dutiesCollection.deleteMany({}, function (err, result) {
                      client.close();
                      doneIt();
                    });
                  });
                });
              }
            };
          });
        });
      });
    });

    it("should not schedule a dutie that is already scheduled when recieving a PUT request to the url /duties/[id]/schedule", function (doneIt) {
      const Http = new XMLHttpRequest();
      MongoClient.connect(mongoUrl, function (err, client) {
        const db = client.db(dbName);
        const dutiesCollection = db.collection('duties');
        const soldiersCollection = db.collection('soldiers');
        dutiesCollection.insertOne({
          "name": "hagnash",
          "location": "soosia",
          "days": "7",
          "constraints": [],
          "soldiersRequired": "1",
          "value": "10",
          "soldiers": ["8411494"]
        }, function (err, resultInsert) {
          soldiersCollection.insertMany([{
            "id": "8411494",
            "name": "ben",
            "rank": "kama",
            "limitations": ["yeshiva"],
            "duties": [resultInsert["insertedId"]]
          }, {
            "id": "1234567",
            "name": "ben",
            "rank": "kama",
            "limitations": [],
            "duties": []
          }], function (err, result) {
            Http.open("PUT", url + "/" + resultInsert["insertedId"].toString() + "/schedule");
            Http.send();
            Http.onreadystatechange = (e) => {
              if (Http.readyState == 4 && Http.status == 200) {
                soldiersCollection.find({}).toArray(function (err, findRes) {
                  expect(findRes[0]["duties"].length).to.eql(1);
                  expect(findRes[1]["duties"].length).to.eql(0);
                  soldiersCollection.deleteMany({}, function (err, result) {
                    dutiesCollection.deleteMany({}, function (err, result) {
                      client.close();
                      doneIt();
                    });
                  });
                });
              }
            };
          });
        });
      });
    });

  });

});