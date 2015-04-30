'use strict';

var cache = require('../');
var should   = require('should');
require('mocha');

describe('gulp-memory-cache', function () {
    describe('cache()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache).should.throw('[gulp-memory-cache] No cache name was supplied');
        });
    });
});
