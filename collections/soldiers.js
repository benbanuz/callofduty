const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const configs = require('../configFile');

// Connection URL
const url = configs.dbUrl;

// Database Name
const dbName = configs.dbName;

// Use connect method to connect to the server
function newSoldier(db, data, callback) {
  if (!(/[0-9]{7}/.test(data["id"]))) {
    callback("The soldier json that was sent is didnt had a legal id", null, 400);
  } else {
    let fields = ["id", "name", "rank", "limitations"];
    let areFieldsLegal = true;

    fields.forEach(function (field) {
      if (!data[field] && areFieldsLegal) {
        callback("The soldier json that was sent is missing the field " + field, null, 400);
        areFieldsLegal = false;
      }
    });

    if (areFieldsLegal) {
      const collection = db.collection('soldiers');
      data["duties"] = [];
      collection.insertOne(data, function (err, result) {
        callback(err, null, null);
      });
    }
  }
}

function getSoldier(db, name, id, callback) {
  const collection = db.collection('soldiers');
  let searchedParams = {};

  if (name) {
    searchedParams["name"] = name;
  }
  if (id) {
    searchedParams["id"] = id;
  }

  collection.find(searchedParams).toArray(function (err, docs) {
    if (docs.length <= 0 && (name || id)) {
      callback("no soldier that answers the given parameters has been found", null, 404);
    } else if (name || (!(name) && !(id))) {
      callback(err, JSON.stringify(docs), null);
    } else {
      callback(err, JSON.stringify(docs[0]), null);
    }
  });
}

module.exports.newSoldier = newSoldier;
module.exports.getSoldier = getSoldier;