const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const configs = require('../config');
const utils = require("../utility/utility");

// Connection URL
const url = configs.dbUrl;

// Database Name
const dbName = configs.dbName;

// Use connect method to connect to the server
function newSoldier(data) {
  const collection = require("../start").soldiersCollecetion;
  const resHandler = require("../start").server.getResHandler();
  let fields = ["id", "name", "rank", "limitations"];

  for (let i = 0; i < fields.length; i++) {
    if (!data[fields[i]]) {
      resHandler.notValidData("The soldier json that was sent is missing the field " + fields[i]);
      return;
    }
  }

  if (!utils.isMatchesRegex(/[0-9]{7}/, data["id"])) {
    resHandler.notValidData("The soldier json that was sent didnt had a legal id");
    return;
  }

  if (!Array.isArray(data["limitations"])) {
    resHandler.notValidData("The limitations field must be an Array");
    return;
  }

  if (Object.keys(data).length != 4) {
    resHandler.notValidData("The soldier json that was sent must only have the fields (id,name,rank,limitations)");
    return;
  }

  data["duties"] = [];
  collection.insertOne(data, function (err, result) {
    if (err) {
      resHandler.notValidData(err);
    } else {
      resHandler.success(null);
    }
  });
}

module.exports.newSoldier = newSoldier;