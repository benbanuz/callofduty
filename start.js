const http = require("http");
const soldierRoute = require("./routes/soldiers.js");
const dutiesRoute = require("./routes/duties");
const justiceBoardRoute = require("./routes/justiceBoard");
const configs = require('./configFile');
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const mongoUrl = configs.dbUrl;

// Database Name
const dbName = configs.dbName;

function routesCases(res, req, primeFolder, numFolders, db, method, url, body, resultCallback) {
  if (/soldiers.*/.test(primeFolder) && numFolders <= 3) {
    soldierRoute.soldierRequest(db, method, url, body, resultCallback);
  } else if (/duties.*/.test(primeFolder) && numFolders <= 4) {
    if (method == "OPTIONS") {
      method = req.headers["access-control-request-method"];
    }
    dutiesRoute.dutieRequest(db, method, url, body, resultCallback);
  } else if (/justiceBoard/.test(url) && method == "GET") {
    justiceBoardRoute.showBoard(db, resultCallback)
  } else {
    res.statusCode = 404;
    res.end();
  }
}

function onEndResponse(req, res, db, method, url, body) {
  body = Buffer.concat(body).toString();
  const numFolders = url.split("/").length;
  const primeFolder = url.split("/")[1];
  const resultCallback = function (err, result, statusCode) {
    if (err) {
      res.statusCode = statusCode;
      res.end(err);
    } else {
      res.end(result);
    }
  };

  if (body != "") {
    body = JSON.parse(body);
  }

  routesCases(res, req, primeFolder, numFolders, db, method, url, body, resultCallback);
}

async function runServer() {
  const client = await MongoClient.connect(mongoUrl, {
    useUnifiedTopology: true
  });

  const db = client.db(dbName);

  const server = http.createServer(function (req, res) {
    const {
      method,
      url
    } = req;

    let body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      onEndResponse(req, res, db, method, url, body);
    });
  }).listen(3000);

  return [server, client, db];
};

module.exports.serverUtils = runServer();