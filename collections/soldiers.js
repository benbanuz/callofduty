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

module.exports.newSoldier = newSoldier;