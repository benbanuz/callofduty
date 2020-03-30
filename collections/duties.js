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

module.exports.newDutie = newDutie;