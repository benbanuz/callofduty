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
      if (name || (!(name) && !(id))) {
        client.close();
        callback(err, JSON.stringify(docs));
      } else {
        client.close();
        callback(err, JSON.stringify(docs[0]));
      }
    });
  });
}

module.exports.newDutie = newDutie;
module.exports.getDutie = getDutie;