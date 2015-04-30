'use strict';

var cache = require('../');
var should   = require('should');
require('mocha');

describe('gulp-memory-cache', function () {
    describe('cache()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache).should.throw();
        });
    });

    describe('cache.save()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.save).should.throw();
        });
    });

    describe('cache.forget()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.forget).should.throw();
        });
    });

    describe('cache.update()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.update).should.throw();
        });
    });

    describe('cache.lastUpdated()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.lastUpdated).should.throw();
        });
    });
});
