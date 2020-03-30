const soldierDb = require("../collections/soldiers");
const url = require("url");

function handleRequest(method, url, data, callback) {
  if (method == "POST") {
    soldierDb.newSoldier(data, callback);
  }
  if (method == "GET") {
    const parsedUrl = new URL("http://localhost:3000/" + url);
    if (/soldiers\/[0-9]{7}/.test(url)) {
      soldierDb.getSoldier(null, url.split("/")[2], callback);
    } else if (parsedUrl.searchParams.has("name")) {
      soldierDb.getSoldier(parsedUrl.searchParams.get("name"), null, callback);
    } else if (/soldiers/.test(url)) {
      soldierDb.getSoldier(null, null, callback);
    } else {
      callback("not a legal url", null);
    }
  }
}

module.exports.soldierRequest = handleRequest;