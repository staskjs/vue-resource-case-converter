'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

//
// Plugin for vue-resource to convert request params to snake case
// and response params to camel case
//

function camelCase(string) {
  var find = /(\_\w)/g;
  var convert = function convert(matches) {
    return matches[1].toUpperCase();
  };
  return string.replace(find, convert);
}

function snakeCase(string) {
  var find = /([A-Z])/g;
  var convert = function convert(matches) {
    return '_' + matches.toLowerCase();
  };
  return string.replace(find, convert);
}

function snakeCaseUnderscoreNumbers(string) {
  var find = /([A-Z0-9]+)/g;
  var convert = function convert(matches) {
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
  var typeWithBrackets = Object.prototype.toString.call(obj);
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
  return Object.keys(obj).reduce(function (newObj, key) {
    newObj[keyConversionFun(key)] = convertObjectKeys(obj[key], keyConversionFun);
    return newObj;
  }, Array.isArray(obj) ? [] : {}); // preserve "arrayness"
}

function mergeOptions(globalOptions, localOptions) {
  // Combines the value of requestUrlFilter/responseUrlFilter with the global options
  if (typeof localOptions === 'boolean') {
    return _extends({}, globalOptions, { convert: localOptions });
  }
  return _extends({}, globalOptions, localOptions);
}

var VueResourceCaseConverter = {

  install: function install(Vue, options) {
    if (Vue.http == null) {
      undefined.$log('Please add http-resource plugin to your Vue instance');
      return;
    }

    var globalOptions = {
      convert: true,
      underscoreNumbers: false,
      requestUrlFilter: function requestUrlFilter() {
        return {};
      },
      responseUrlFilter: function responseUrlFilter() {
        return {};
      }
    };
    Object.keys(globalOptions).forEach(function (key) {
      if (options && options.hasOwnProperty(key)) {
        globalOptions[key] = options[key];
      }
    });

    Vue.http.interceptors.push(function (request, next) {
      var options = mergeOptions(globalOptions, globalOptions.requestUrlFilter(request.url));
      if (options.convert) {
        var keyConversionFun = options.underscoreNumbers ? snakeCaseUnderscoreNumbers : snakeCase;
        request.params = convertObjectKeys(request.params, keyConversionFun);
        request.body = convertObjectKeys(request.body, keyConversionFun);
      }
      next(function (response) {
        var options = mergeOptions(globalOptions, globalOptions.responseUrlFilter(response.url));
        if (options.convert) {
          response.body = convertObjectKeys(response.body, camelCase);
        }
        return response;
      });
    });
  }
};

if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
  module.exports = VueResourceCaseConverter;
}