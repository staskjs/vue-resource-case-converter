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

var VueResourceCaseConverter = {

  install: (Vue, options) => {
    let requestUrlFilter = function () {
      return true;
    };

    let responseUrlFilter = function () {
      return true;
    };

    if (options != null && options.requestUrlFilter) {
      requestUrlFilter = options.requestUrlFilter;
    }
    if (options != null && options.responseUrlFilter) {
      responseUrlFilter = options.responseUrlFilter;
    }

    if (Vue.http == null) {
      this.$log('Please add http-resource plugin to your Vue instance');
      return;
    }

    Vue.http.interceptors.push((request, next) => {
      if (requestUrlFilter(request.url)) {
        request.params = convertObjectKeys(request.params, snakeCase);
        request.body = convertObjectKeys(request.body, snakeCase);
      }

      next((response) => {
        if (!responseUrlFilter(response.url)) {
          return response;
        }

        let parsedBody;
        try {
          parsedBody = JSON.parse(response.body);
        }
        catch (e) {
          return response;
        }

        const convertedBody = convertObjectKeys(parsedBody, camelCase);
        response.body = JSON.stringify(convertedBody);
        return response;
      });
    });
  },
};

if (typeof module === 'object' && module.exports) {
  module.exports = VueResourceCaseConverter;
}
