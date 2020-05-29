const serverUrl = require("../config").serverUrl;
const utils = require("../utility/utility");
const path = require("path");

function handleRequest(method, url, data) {
  const router = require("../start").server.getRouter();
  const errmsg = "not a legal url, url needs to be of the form "

  switch (method) {
    case "POST":
      router.newDutie(data);
      break;
    case "GET":
      const parsedUrl = new URL(path.join(serverUrl, url));
      switch (true) {
        case utils.isMatchesRegex(/duties\/.*/, url):
          router.getDutie(null, url.split("/")[2]);
          break;
        case parsedUrl.searchParams.has("name"):
          router.getDutie(parsedUrl.searchParams.get("name"), null);
          break;
        case utils.isMatchesRegex(/duties/, url):
          router.getDutie();
          break;
        default:
          router.routeNotFound(errmsg + "/duties/[id] or /duties?name='name' or /duties");
      }
      break;
    case "DELETE":
      if (utils.isMatchesRegex(/duties\/.*/, url)) {
        router.deleteDutie(url.split("/")[2]);
      } else {
        router.routeNotFound(errmsg + "/duties/[id]");
      }
      break;
    case "PATCH":
      if (utils.isMatchesRegex(/duties\/.*/, url)) {
        router.updateDutie(data, url.split("/")[2]);
      } else {
        router.routeNotFound(errmsg + "/duties/[id]");
      }
      break;
    case "PUT":
      if (utils.isMatchesRegex(/duties\/.*\/schedule/, url)) {
        router.scheduleDutie(url.split("/")[2]);
      } else {
        router.routeNotFound(errmsg + "/duties/[id]");
      }
      break;
    default:
      router.methodNotSupported("a request to the duties collection can be one of the methods POST,GET,DELETE,PATCH,PUT");
  }
}

module.exports.dutieRequest = handleRequest;