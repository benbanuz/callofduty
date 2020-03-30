const http = require("http");
const soldierRoute = require("./routes/soldiers.js");
const dutiesRoute = require("./routes/duties");
const justiceBoardRoute = require("./routes/justiceBoard");
const configs = require('./config');
const MongoClient = require('mongodb').MongoClient;
const utils = require("./utility/utility");
const soldierDb = require("./collections/soldiers");

// Connection URL
const mongoUrl = configs.dbUrl;

// Database Name
const dbName = configs.dbName;

let db = 1;

class ErrorHandler {
  constructor(callback) {
    this.callback = callback;
  }

  success(data) {
    this.callback(null, data, 200);
  }

  notValidData(errMsg) {
    this.callback(errMsg, null, 400);
  }

  routeNotFound(errMsg) {
    this.callback(errMsg, null, 404);
  }

  methodNotSupported(errMsg) {
    this.callback(errMsg, null, 405)
  }
}

class Router {
  constructor(db, callback, errorHandler) {
    this.db = db;
    this.callback = callback;
    this.errorHandler = errorHandler;
  }

  routeToNewSoldier(data) {
    soldierDb.newSoldier(this.db.collection('soldiers'), data, this.errorHandler);
  }

  routeToGetSoldier(name, id) {
    soldierDb.getSoldier(this.db.collection('soldiers'), name, id, this.errorHandler);
  }

  routeNotFound(errMsg) {
    this.errorHandler.routeNotFound(errMsg);
  }

  methodNotSupported(errMsg) {
    this.errorHandler.methodNotSupported(errMsg);
  }
}

function response(router, method, url, body) {
  const primeFolder = url.split("/")[1];

  switch (true) {
    case utils.isMatchesRegex(/soldiers.*/, primeFolder):
      soldierRoute.soldierRequest(method, url, body, router);
      break;
    case utils.isMatchesRegex(/duties.*/, primeFolder):
      dutiesRoute.dutieRequest(method, url, body, router);
      break;
    case utils.isMatchesRegex(/justiceBoard/, url) && method == "GET":
      justiceBoardRoute.showBoard(router);
      break;
    default:
      router.routeNotFound(["not a valid route", null, 404]);
  };
}

function runServer(callback) {
  MongoClient.connect(mongoUrl, function (err, client) {
    db = client.db(dbName);

    const server = http.createServer(function (req, res) {
      const {
        method,
        url
      } = req;

      const resultCallback = function (err, result, statusCode) {
        if (err) {
          res.statusCode = statusCode;
          res.end(err);
        } else {
          res.end(result);
        }
      };

      const errorHandler = new ErrorHandler(resultCallback);
      const router = new Router(db, resultCallback, errorHandler);

      let body = [];
      req.on('data', (chunk) => {
        body.push(chunk);
      }).on('end', () => {
        body = Buffer.concat(body).toString();
        if (!utils.isEmpty(body)) {
          body = JSON.parse(body);
        }
        if (utils.isMethodOptions(method)) {
          method = req.headers["access-control-request-method"];
        }
        response(router, method, url, body);
      });
    }).listen(3000);
    callback(server, client, db);
  });
};

module.exports.runServer = runServer;