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

function getSoldier(name, id, callback) {
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    const collection = db.collection('soldiers');

    let searchedParams = {};

    if (name) {
      searchedParams["name"] = name;
    }
    if (id) {
      searchedParams["id"] = id;
    }

    collection.find(searchedParams).toArray(function (err, docs) {
      assert.equal(err, null);
      if (docs.length <= 0 && (name || id)) {
        client.close();
        callback("no soldier that answers the given parameters has been found", null);
      } else if (name || (!(name) && !(id))) {
        client.close();
        callback(err, JSON.stringify(docs));
      } else {
        client.close();
        callback(err, JSON.stringify(docs[0]));
      }
    });
  });
}

module.exports.newSoldier = newSoldier;
module.exports.getSoldier = getSoldier;