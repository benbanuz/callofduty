const objectId = require("mongodb").ObjectId;
const utils = require("../utility/utility");

function newDutie(data) {
  const collection = require("../start").dutiesCollection;
  const resHandler = require("../start").server.getResHandler();
  const fields = ["name", "location", "days", "constraints", "soldiersRequired", "value"];

  for (let i = 0; i < fields.length; i++) {
    if (!data[fields[i]]) {
      resHandler.notValidData("The dutie json that was sent is missing the field " + fields[i]);
      return;
    }
  }

  if (Object.keys(data).length != fields.length) {
    resHandler.notValidData("The dutie json that was sent must only have the fields (name,location,days,constraints,soldierRequired,value)");
    return;
  }

  if (!Array.isArray(data["constraints"])) {
    resHandler.notValidData("The constraints field must be an Array");
    return;
  }

  data["soldiers"] = [];
  collection.insertOne(data, function (err, result) {
    if (err) {
      resHandler.notValidData(err);
    } else {
      resHandler.success(null);
    }
  });
}

function getDutie(name, id) {
  const collection = require("../start").dutiesCollection;
  const resHandler = require("../start").server.getResHandler();
  let searchedParams = {};

  if (utils.isIdLegal(id, resHandler)) {
    return;
  }

  utils.setParamsForSearch(searchedParams, ["name", "_id"], [name, utils.myObjectId(id)]);

  collection.find(searchedParams).toArray(function (err, docs) {
    let isAdditionalParams = (name || id);
    if (docs.length <= 0 && isAdditionalParams) {
      resHandler.routeNotFound("no duty that answers the given parameters has been found");
    } else if (id) {
      resHandler.success(JSON.stringify(docs[0]));
    } else {
      resHandler.success(JSON.stringify(docs));
    }
  });
}

module.exports.newDutie = newDutie;
module.exports.getDutie = getDutie;