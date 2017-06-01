//
// Plugin for vue-resource to convert request params to snake case
// and response params to camel case
//

function camelCase (string) {
  let find = /(\_\w)/g;
  let convert = function(matches) {
    return matches[1].toUpperCase();
  };
  return string.replace(find, convert);
}

function snakeCase (string) {
  let find = /([A-Z])/g;
  let convert = function(matches) {
    return '_' + matches.toLowerCase();
  };
  return string.replace(find, convert);
}

function snakeCaseUnderscoreNumbers (string) {
  let find = /([A-Z0-9]+)/g;
  let convert = function(matches) {
    return '_' + matches.toLowerCase();
  };
  return string.replace(find, convert);
}

function getClass(obj) {
    // Workaround for detecting native classes.
    // Examples:
    // getClass({}) === 'Object'
    // getClass([]) === 'Array'
    // getClass(function () {}) === 'Function'
    // getClass(new Date) === 'Date'
    // getClass(null) === 'Null'

    // Here we get a string like '[object XYZ]'
  const typeWithBrackets = Object.prototype.toString.call(obj);
    // and we extract 'XYZ' from it
  return typeWithBrackets.match(/\[object (.+)\]/)[1];
}
function convertObjectKeys(obj, keyConversionFun) {
    // Creates a new object mimicking the old one with keys changed using the keyConversionFun.
    // Does a deep conversion.
    // Taken from https://github.com/ZupIT/angular-http-case-converter
  if (getClass(obj) !== 'Object' && getClass(obj) !== 'Array') {
    return obj; // Primitives are returned unchanged.
  }
  return Object.keys(obj).reduce((newObj, key) => {
    newObj[keyConversionFun(key)] = convertObjectKeys(obj[key], keyConversionFun);
    return newObj;
  }, Array.isArray(obj) ? [] : {}); // preserve "arrayness"
}

function mergeOptions(globalOptions, localOptions) {
  // Combines the value of requestUrlFilter/responseUrlFilter with the global options
  if (typeof(localOptions) === 'boolean') {
    return Object.assign({}, globalOptions, {convert: localOptions});
  }
  return Object.assign({}, globalOptions, localOptions);
}

var VueResourceCaseConverter = {

  install: (Vue, options) => {
    if (Vue.http == null) {
      this.$log('Please add http-resource plugin to your Vue instance');
      return;
    }

    let globalOptions = {
      convert: true,
      underscoreNumbers: false,
      requestUrlFilter () {
        return {};
      },
      responseUrlFilter () {
        return {};
      }
    };
    Object.keys(globalOptions).forEach((key) => {
      if (options && options.hasOwnProperty(key)) {
        globalOptions[key] = options[key];
      }
    });

    Vue.http.interceptors.push((request, next) => {
      let options = mergeOptions(globalOptions, globalOptions.requestUrlFilter(request.url));
      if (options.convert) {
        let keyConversionFun = options.underscoreNumbers ? snakeCaseUnderscoreNumbers : snakeCase;
        request.params = convertObjectKeys(request.params, keyConversionFun);
        request.body = convertObjectKeys(request.body, keyConversionFun);
      }
      next((response) => {
        let options = mergeOptions(globalOptions, globalOptions.responseUrlFilter(response.url));
        if (options.convert) {
          response.body = convertObjectKeys(response.body, camelCase);
        }
        return response;
      });
    });
  },
};

if (typeof module === 'object' && module.exports) {
  module.exports = VueResourceCaseConverter;
}
