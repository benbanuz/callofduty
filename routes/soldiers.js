const url = require("url");
const serverUrl = require("../config").serverUrl;
const utils = require("../utility/utility");

function handleRequest(method, url, data) {
  const router = require("../start").server.getRouter();
  switch (method) {
    case "POST":
      router.newSoldier(data);
      break;
    case "GET":
      const parsedUrl = new URL(serverUrl + url);
      //check if the requested url is of the form of soldiers/[id]
      if (utils.isMatchesRegex(/soldiers\/[0-9]{7}/, url)) {
        router.getSoldier(null, url.split("/")[2]);
      } else if (parsedUrl.searchParams.has("name")) {
        router.getSoldier(parsedUrl.searchParams.get("name"), null);
      } else if (utils.isMatchesRegex(/soldiers/, url)) {
        router.getSoldier();
      } else {
        router.routeNotFound("not a legal url, url needs to be of the form /soldiers/[id] or /soldiers?name='name' or /soldiers");
      }
      break;
    default:
      router.methodNotSupported("a request to the soldiers collection can be one of the methods POST,GET");
  }
}

module.exports.soldierRequest = handleRequest;