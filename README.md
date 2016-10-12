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

In order to restrict certain urls from converting,
you can do it by providing `responseUrlFilter` or `requestUrlFilter` function to
configuration object. These functions receive `url` and should return true for url
to be processed by interceptor.

    Vue.use(VueResourceCaseConverter, {
      responseUrlFilter(url) {
        // Your custom logic
        // For example:
        // return url.indexOf('api') >= 0;
      },

      requestUrlFilter(url) {
        // Your custom logic
      },
    });

## Notes

This plugin was inspired by [this angular.js version](https://github.com/ZupIT/angular-http-case-converter).
