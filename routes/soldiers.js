const url = require("url");
const serverUrl = require("../config").serverUrl;
const utils = require("../utility/utility");

function handleRequest(method, url, data, router) {
  switch (method) {
    case "POST":
      router.routeToNewSoldier(data);
      break;
    case "GET":
      const parsedUrl = new URL(serverUrl + url);
      //check if the requested url is of the form of soldiers/[id]
      if (utils.isMatchesRegex(/soldiers\/[0-9]{7}/, url)) {
        router.routeToGetSoldier(null, url.split("/")[2]);
      } else if (parsedUrl.searchParams.has("name")) {
        router.routeToGetSoldier(parsedUrl.searchParams.get("name"), null);
      } else if (utils.isMatchesRegex(/soldiers/, url)) {
        router.routeToGetSoldier();
      } else {
        router.routeNotFound("not a legal url");
      }
      break;
    default:
      router.methodNotSupported("not a supported method for a request");
  }
}

module.exports.soldierRequest = handleRequest;