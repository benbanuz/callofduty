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

module.exports.newDutie = newDutie;