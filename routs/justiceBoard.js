const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const async = require("async");
// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

function computeScores(duties, dutiesCollection, callback) {
  let sum = 0;
  async.forEachOf(duties, (dutie, key, doneElement) => {
    dutiesCollection.find({
      "_id": dutie
    }).toArray(function (err, result) {
      sum += Number(result[0]["value"]);
      doneElement();
    });
  }, err => {
    callback(sum);
  });
}

function getJb(callback) {
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    const db = client.db(dbName);
    const soldiersCollection = db.collection('soldiers');
    const dutiesCollection = db.collection('duties');
    let justiceBoard = [];

    soldiersCollection.find({}).toArray(function (err, docs) {
      assert.equal(err, null);
      async.forEachOf(docs, (soldier, key, doneElement) => {
        let duties = soldier["duties"];
        computeScores(duties, dutiesCollection, function (sum) {
          justiceBoard.push({
            "id": soldier["id"],
            "score": sum
          })
          doneElement();
        });
      }, err => {
        client.close();
        callback(err, JSON.stringify(justiceBoard));
      });
    });
  });
}

module.exports.showBoard = getJb;