const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Use connect method to connect to the server
function newSoldier(data, callback) {
  if (!(/[0-9]{7}/.test(data["id"]) && data["name"] && data["rank"] && data["limitations"])) {
    callback("The soldier json that was sent is ileagal", null);
  } else {
    MongoClient.connect(url, function (err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      const collection = db.collection('soldiers');
      data["duties"] = [];
      collection.insertOne(data, function (err, result) {
        assert.equal(err, null);
        client.close();
        callback(err, null);
      });
    });
  }
}

module.exports.newSoldier = newSoldier;