const http = require("http");
const soldierRoute = require("./routs/soldiers.js");
const dutiesRoute = require("./routs/duties");
const jbRoute = require("./routs/justiceBoard");

var server = http.createServer(function (req, res) {
  var {
    method,
    url
  } = req;

  let body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  }).on('end', () => {
    body = Buffer.concat(body).toString();
    if (body != "") {
      body = JSON.parse(body);
    }
    if (/soldiers.*/.test(url.split("/")[1]) && url.split("/").length <= 3) {
      soldierRoute.soldierRequest(method, url, body, function (err, result) {
        if (err) {
          res.statusCode = 400;
          res.end(err);
        } else {
          res.end(result);
        }
      });
    } else if (/duties.*/.test(url.split("/")[1]) && url.split("/").length <= 4) {
      if (method == "OPTIONS") {
        method = req.headers["access-control-request-method"];
      }
      dutiesRoute.dutieRequest(method, url, body, function (err, result) {
        if (err) {
          res.statusCode = 400;
          res.end(err);
        } else {
          res.end(result);
        }
      });
    } else if (/justiceBoard/.test(url) && method == "GET") {
      jbRoute.showBoard(function (err, board) {
        if (err) {
          res.statusCode = 400;
          res.end(err);
        } else {
          res.end(board);
        }
      })
    } else {
      res.statusCode = 404;
      res.end();
    }
  });

}).listen(3000);