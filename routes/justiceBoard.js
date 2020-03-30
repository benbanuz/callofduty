const async = require("async");


function computeScores(duties, dutiesCollection, callback) {
  let sum = 0;
  async.forEachOf(duties, (dutie, key, next) => {
    dutiesCollection.find({
      "_id": dutie
    }).toArray(function (err, result) {
      sum += Number(result[0]["value"]);
      next();
    });
  }, err => {
    callback(sum);
  });
}

function getJusticeBoard(callback) {
  const soldiersCollection = require("../start").soldiersCollecetion;
  const dutiesCollection = require("../start").dutiesCollection;
  let justiceBoard = [];

  soldiersCollection.find({}).toArray(function (err, docs) {
    async.forEachOf(docs, (soldier, key, next) => {
      computeScores(soldier["duties"], dutiesCollection, function (sum) {
        justiceBoard.push({
          "id": soldier["id"],
          "score": sum
        })
        next();
      });
    }, err => {
      callback(justiceBoard);
    });
  });
}

function getJusticeBoardRoute() {
  const resHandler = require("../start").server.getResHandler();
  getJusticeBoard((justiceBoard) => {
    resHandler.success(JSON.stringify(justiceBoard));
  });
}

module.exports.showBoard = getJusticeBoardRoute;
module.exports.getJusticeBoard = getJusticeBoard;