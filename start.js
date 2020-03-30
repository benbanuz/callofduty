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


class responseHandler {
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
  constructor(resHandler) {
    this.resHandler = resHandler;
  }

  routeToNewSoldier(data) {
    soldierDb.newSoldier(data);
  }

  routeToGetSoldier(name, id) {
    soldierDb.getSoldier(name, id);
  }

  routeNotFound(errMsg) {
    this.resHandler.routeNotFound(errMsg);
  }

  methodNotSupported(errMsg) {
    this.resHandler.methodNotSupported(errMsg);
  }
}

function response(method, url, body) {
  const primeFolder = url.split("/")[1];

  switch (true) {
    case utils.isMatchesRegex(/soldiers.*/, primeFolder):
      soldierRoute.soldierRequest(method, url, body);
      break;
    case utils.isMatchesRegex(/duties.*/, primeFolder):
      dutiesRoute.dutieRequest(method, url, body);
      break;
    case utils.isMatchesRegex(/justiceBoard/, url) && method == "GET":
      justiceBoardRoute.showBoard();
      break;
    default:
      router.routeNotFound(["not a valid route", null, 404]);
  };
}

class myServer extends http.Server {
  getRouter(router) {
    return this.router;
  }
  getResHandler() {
    return this.resHandler;
  }
}

function runServer(callback) {
  MongoClient.connect(mongoUrl, function (err, client) {
    const db = client.db(dbName);

    const server = new myServer(function (req, res) {
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

      const resHandler = new responseHandler(resultCallback);
      const router = new Router(resHandler);
      this.resHandler = resHandler;
      this.router = router;

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
        response(method, url, body);
      });
    }).listen(3000);

    module.exports.server = server;
    module.exports.soldiersCollecetion = db.collection("soldiers");
    callback(server, client, db);
  });
};

module.exports.runServer = runServer;