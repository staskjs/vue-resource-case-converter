# vue-resource-case-converter

Module attaches interceptors to vue instance which process request and responses
to convert keys on JSON objects to camelCase for responses and snake_case for requests.

Your vue instance should have `vue-resource` plugin installed and connected.

## Why?

Very often popular backends use snake case as their default code style,
while camel case is usually used in javascript.

This module can be used to keep consistent code style on both backend and your vue frontend.

## Installation

    $ npm i vue-resource-case-converter

Then in your code:

    const Vue = require('vue');
    const VueResource = require('vue-resource');
    const VueResourceCaseConverter = require('vue-resource-case-converter');

    Vue.use(VueResource);
    Vue.use(VueResourceCaseConverter);

If you are still using older version of vue-resource (0.\*) then use 1.\* version of
case converter.

Version 2.\* does not work with 0.\* version of vue-resource, because it has some breaking changes.

## Configuration

A number of configuration options are supported, which can be set either globally or on a
URL-by-URL basis.

- __`convert` (boolean)__: Whether to convert JSON keys between cases. Defaults to `true`.
- __`underscoreNumbers` (boolean)__: Whether to treat numbers as the start of a new word within
  the key. For example, if true, `fooBar2` converts to `foo_bar_2`; otherwise, `fooBar2`
  converts to `foo_bar2`. Defaults to `false`.
- __`responseUrlFilter` (function)__: If provided, customizes behavior by URL. The function takes
  a URL as the first argument, and should return either a boolean or an object. A boolean
  indicates simply whether or not to make case conversions, and allows you to turn off case
  conversion for particular APIs or URLs. An object return value should mirror the global
  options and allows you to override `convert` and `underscoreNumbers` on a URL basis.
  Defaults to `null`.
- __`requestUrlFilter` (function)__: Same as `responseUrlFilter`, but for resquests.

For example:

    Vue.use(VueResourceCaseConverter, {
      convert: false,  // e.g., to turn off by default, and enable by URL
      underscoreNumbers: false,
      responseUrlFilter(url) {
        if (/api\/v2/.test(url)) {
          return {
            convert: true
          };
        }
      },
      requestUrlFilter(url) {
        if (/api\/v2/.test(url)) {
          return {
            convert: true
          };
        }
      }
    });

## Notes

This plugin was inspired by [this angular.js version](https://github.com/ZupIT/angular-http-case-converter).
