function isEmpty(string) {
  return string == "";
}

function isMethodOptions(method) {
  return method == "OPTIONS";
}

function isMatchesRegex(regex, string) {
  return regex.test(string);
}

module.exports.isEmpty = isEmpty;
module.exports.isMethodOptions = isMethodOptions;
module.exports.isMatchesRegex = isMatchesRegex;