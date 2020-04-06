const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require("mongodb").ObjectID;
const jbRoute = require("../routs/justiceBoard");
const async = require("async");

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

function newDutie(data, callback) {
  if (!(data["name"] && data["location"] && data["days"] && data["constraints"] && data["soldiersRequired"] && data["value"])) {
    callback("The dutie json that was sent is ileagal", null);
  } else {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('duties');
      data["soldiers"] = [];
      collection.insertOne(data, function (err, result) {
        assert.equal(err, null);
        client.close();
        callback(err, null);
      });
    });
  }
}

function getDutie(name, id, callback) {
  if (!id || (id && /[0-9a-fA-F]{24}/.test(id))) {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('duties');

      let searchedParams = {};

      if (name) {
        searchedParams["name"] = name;
      }

      if (id) {
        searchedParams["_id"] = ObjectId(id);
      }

      collection.find(searchedParams).toArray(function (err, docs) {
        assert.equal(err, null);
        if (docs.length <= 0 && (name || id)) {
          client.close();
          callback("no dutie that answers the given parameters has been found", null);
        } else if (name || (!(name) && !(id))) {
          client.close();
          callback(err, JSON.stringify(docs));
        } else {
          client.close();
          callback(err, JSON.stringify(docs[0]));
        }
      });
    });
  } else {
    callback("thats an ileagal id for a dutie", null);
  }
}

function deleteDutie(id, callback) {
  if (/[0-9a-fA-F]{24}/.test(id)) {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('duties');

      let searchedParams = {
        "_id": ObjectId(id)
      };

      collection.find(searchedParams).toArray(function (err, doc) {
        assert.equal(err, null);
        if (doc.length == 1 && doc[0]["soldiers"].length == 0) {
          collection.deleteOne(searchedParams, function (err, result) {
            client.close();
            callback(err, null);
          });
        } else {
          client.close();
          callback("dutie cannot be deleted", null);
        }
      });
    });
  } else {
    callback("thats an ileagal id for a dutie", null);
  }
}

function updateDutie(data, id, callback) {
  if (/[0-9a-fA-F]{24}/.test(id)) {
    let arePropertiesValid = true;
    let leagalKeys = ["name", "location", "days", "constraints", "soldiersRequired", "value", "soldiers"];
    for (let key in data) {
      if (!(leagalKeys.includes(key))) {
        arePropertiesValid = false;
      }
    }

    if (arePropertiesValid) {
      MongoClient.connect(url, function (err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        const collection = db.collection('duties');

        collection.find({
          "_id": ObjectId(id)
        }).toArray(function (err, doc) {
          if (doc.length == 1 && doc[0]["soldiers"].length == 0) {
            collection.updateOne({
              "_id": ObjectId(id)
            }, {
              $set: data
            }, function (err, result) {
              assert.equal(err, null);
              client.close();
              callback(err, null);
            });
          } else {
            client.close();
            callback("dutie cannot be updated", null);
          }
        });
      });
    } else {
      callback("ileagal properties to update", null);
    }
  } else {
    callback("thats an ileagal id for a dutie", null);
  }
}


function schedule(id, callback) {
  jbRoute.showBoard(function (err, board) {
    board = JSON.parse(board);
    board = board.sort(function (a, b) {
      return a.score > b.score;
    });
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const dutiesCollection = db.collection('duties');
      const soldiersCollection = db.collection('soldiers');

      dutiesCollection.find({
        "_id": ObjectId(id)
      }).toArray(function (err, doc) {
        let numSoldiersToAssign = Number(doc[0]["soldiersRequired"]) - doc[0]["soldiers"].length;
        async.forEachOf(board, (soldier, key, doneElement) => {
          soldiersCollection.find({
            "id": soldier["id"]
          }).toArray(function (err, fullSoldier) {
            if (!(numSoldiersToAssign <= 0 || doc[0]["constraints"].some(function (element, index, array) {
                return fullSoldier[0]["limitations"].includes(element);
              }))) {
              numSoldiersToAssign -= 1;
              soldiersCollection.updateOne({
                "id": soldier["id"]
              }, {
                $push: {
                  "duties": doc[0]["_id"]
                }
              }, function (err, result) {
                dutiesCollection.updateOne({
                    "_id": ObjectId(id)
                  }, {
                    $push: {
                      "soldiers": soldier["id"]
                    }
                  },
                  function (err, result) {
                    doneElement();
                  });
              });
            } else {
              doneElement();
            }
          });
        }, err => {
          client.close();
          callback(err, null);
        });
      });
    });
  });
}

module.exports.newDutie = newDutie;
module.exports.getDutie = getDutie;
module.exports.deleteDutie = deleteDutie;
module.exports.updateDutie = updateDutie;
module.exports.schedule = schedule;