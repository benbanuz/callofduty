const objectId = require("mongodb").ObjectId;

function isEmpty(string) {
  return string == "";
}

function isMethodOptions(method) {
  return method == "OPTIONS";
}

function isMatchesRegex(regex, string) {
  return regex.test(string);
}

function setParamsForSearch(searchObject, keys, params) {
  params.forEach(function (param, index) {
    if (param) {
      searchObject[keys[index]] = param;
    }
  });
}

function myObjectId(id) {
  if (id) {
    return objectId(id)
  }
  return id;
}

function isIdLegal(id, resHandler) {
  if (id && !isMatchesRegex(/[0-9a-fA-F]{24}/, id)) {
    resHandler.routeNotFound("the id that was sent is not legal, it needs to be of 24 chars in alpha-numeric");
    return true;
  }
  return false;
}

module.exports.isEmpty = isEmpty;
module.exports.isMethodOptions = isMethodOptions;
module.exports.isMatchesRegex = isMatchesRegex;
module.exports.setParamsForSearch = setParamsForSearch;
module.exports.myObjectId = myObjectId;
module.exports.isIdLegal = isIdLegal;
