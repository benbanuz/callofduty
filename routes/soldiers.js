const soldierDb = require("../collections/soldiers");
const url = require("url");

function handleRequest(db, method, url, data, callback) {
  switch (method) {
    case "POST":
      soldierDb.newSoldier(db, data, callback);
      break;
    case "GET":
      const parsedUrl = new URL("http://localhost:3000/" + url);
      if (/soldiers\/[0-9]{7}/.test(url)) {
        soldierDb.getSoldier(db, null, url.split("/")[2], callback);
      } else if (parsedUrl.searchParams.has("name")) {
        soldierDb.getSoldier(db, parsedUrl.searchParams.get("name"), null, callback);
      } else if (/soldiers/.test(url)) {
        soldierDb.getSoldier(db, null, null, callback);
      } else {
        callback("not a legal url", null, 404);
      }
      break;
    default:
      callback("not a supported method for a request", null, 405);
  }
}

module.exports.soldierRequest = handleRequest;