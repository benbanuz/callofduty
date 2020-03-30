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

module.exports.isEmpty = isEmpty;
module.exports.isMethodOptions = isMethodOptions;
module.exports.isMatchesRegex = isMatchesRegex;
module.exports.setParamsForSearch = setParamsForSearch;