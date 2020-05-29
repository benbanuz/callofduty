const objectId = require("mongodb").ObjectId;
const utils = require("../utility/utility");
const async = require("async");

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

function deleteDutie(id) {
  const resHandler = require("../start").server.getResHandler();
  const collection = require("../start").dutiesCollection;

  if (utils.isIdLegal(id, resHandler)) {
    return;
  }

  let searchedParams = {
    "_id": objectId(id)
  };

  collection.find(searchedParams).toArray(function (err, doc) {
    let isDutieExists = (doc.length == 1);
    let isDutieDeletable = isDutieExists && (doc[0]["soldiers"].length == 0);

    if (isDutieDeletable) {
      collection.deleteOne(searchedParams, function (err, result) {
        resHandler.success();
      });
    } else if (isDutieExists && !isDutieDeletable) {
      resHandler.notValidData("dutie cannot be deleted beacuse its already assigned");
    } else {
      resHandler.success("the referenced dutie already deleted");
    }
  });
}

function updateDutie(data, id) {
  const resHandler = require("../start").server.getResHandler();
  const collection = require("../start").dutiesCollection;

  if (utils.isIdLegal(id, resHandler)) {
    return;
  }

  let leagalKeys = ["name", "location", "days", "constraints", "soldiersRequired", "value", "soldiers"];
  if (!Object.keys(data).every(key => leagalKeys.indexOf(key) > -1)) {
    resHandler.notValidData("ileagal properties to update, only keys that can be updated are (name,location,days,constrains,soldiersRequired,value,soldiers)");
    return;
  }

  collection.find({
    "_id": objectId(id)
  }).toArray(function (err, doc) {
    let exist = (doc.length == 1);
    let notScheduled = (exist && (doc[0]["soldiers"].length == 0));

    if (notScheduled) {
      collection.updateOne({
        "_id": objectId(id)
      }, {
        $set: data
      }, function (err, result) {
        resHandler.success();
      });
    } else if (exist && !notScheduled) {
      resHandler.notValidData("the specified dutie to update is already scheduled");
    } else {
      resHandler.routeNotFound("the specified dutie to update does not exist");
    }
  });
}

function updateCollections(soldier, id, doc, doneElement) {
  const soldiersCollection = require("../start").soldiersCollecetion;
  const dutiesCollection = require("../start").dutiesCollection;

  async.parallel([
    function (callback) {
      soldiersCollection.updateOne({
        "id": soldier["id"]
      }, {
        $push: {
          "duties": doc["_id"]
        }
      }, function (err, result) {
        callback();
      });
    },
    function (callback) {
      dutiesCollection.updateOne({
          "_id": objectId(id)
        }, {
          $push: {
            "soldiers": soldier["id"]
          }
        },
        function (err, result) {
          callback();
        });
    }
  ], doneElement);
}

function schedule(id) {
  const resHandler = require("../start").server.getResHandler();
  const soldiersCollection = require("../start").soldiersCollecetion;
  const dutiesCollection = require("../start").dutiesCollection;
  const justiceBoardRoute = require("../routes/justiceBoard")

  async.waterfall([
    function getBoard(done) {
      justiceBoardRoute.getJusticeBoard(function (board) {
        done(null, board);
      });
    },
    function getDutie(board, done) {
      board = board.sort(function (a, b) {
        return a.score > b.score;
      });

      dutiesCollection.find({
        "_id": objectId(id)
      }).toArray(function (err, dutieToFill) {
        done(null, board, dutieToFill[0]);
      });
    },
    function assignSoldiers(board, dutieToFill, done) {
      let numSoldiersToAssign = Number(dutieToFill["soldiersRequired"]) - dutieToFill["soldiers"].length;

      async.forEachOf(board, (soldier, key, doneElement) => {
        soldiersCollection.find({
          "id": soldier["id"]
        }).toArray(function (err, fullSoldier) {
          let canSoldierDoIt = dutieToFill["constraints"].some(function (element, index, array) {
            return fullSoldier[0]["limitations"].includes(element);
          });

          if (!(numSoldiersToAssign <= 0 || canSoldierDoIt)) {
            numSoldiersToAssign -= 1;
            updateCollections(soldier, id, dutieToFill, doneElement);
          } else {
            doneElement();
          }
        });
      }, err => {
        done();
      });
    }
  ], function (err, res) {
    resHandler.success();
  });
}

module.exports.newDutie = newDutie;
module.exports.getDutie = getDutie;
module.exports.deleteDutie = deleteDutie;
module.exports.updateDutie = updateDutie;
module.exports.scheduleDutie = schedule;