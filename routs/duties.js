const dutieDb = require("../collections/duties");
const url = require("url");

function handleRequest(method, url, data, callback) {
  if (method == "POST") {
    if (/duties/.test(url)) {
      dutieDb.newDutie(data, callback);
    } else {
      callback("not a legal url", null);
    }
  }
  if (method == "GET") {
    const parsedUrl = new URL("http://localhost:3000/" + url);
    if (/duties\/.*/.test(url)) {
      dutieDb.getDutie(null, url.split("/")[2], callback);
    } else if (parsedUrl.searchParams.has("name")) {
      dutieDb.getDutie(parsedUrl.searchParams.get("name"), null, callback);
    } else if (/duties/.test(url)) {
      dutieDb.getDutie(null, null, callback);
    } else {
      callback("not a legal url", null);
    }
  }
  if (method == "DELETE") {
    if (/duties\/.*/.test(url)) {
      dutieDb.deleteDutie(url.split("/")[2], callback);
    } else {
      callback("not a legal url", null);
    }
  }
  if (method == "PATCH") {
    if (/duties\/.*/.test(url)) {
      dutieDb.updateDutie(data, url.split("/")[2], callback);
    } else {
      callback("not a legal url", null);
    }
  }
  if (method == "PUT") {
    if (/duties\/.*\/schedule/.test(url)) {
      dutieDb.schedule(url.split("/")[2], callback);
    } else {
      callback("not a legal url", null);
    }
  }
}

module.exports.dutieRequest = handleRequest;