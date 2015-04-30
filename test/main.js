'use strict';

var cache    = require('../');
var through  = require('through2');
var should   = require('should');
var File     = require('vinyl');
var assert   = require('stream-assert');
var array    = require('stream-array');

require('mocha');

describe('gulp-memory-cache', function () {
    describe('cache()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache).should.throw();
        });

        it('should not throw an exception if the specified cache doesn\'t exist', function () {
            cache.bind(cache, 'cacheName').should.not.throw();
        });

        it('should save to cache if save=true (default)', function (done) {
            createStream(5)
                .pipe(cache('js'))
                .pipe(assert.length(5))
                .pipe(assertCacheLengthOnEnd('js', 5, done));
        });

        it('should add new items to cache if save=true and retrieve all files from cache', function (done) {
            array([makeFile('file-5.js', 'New file')])
                .pipe(cache('js'))
                .pipe(assert.length(6))
                .pipe(assertCacheLengthOnEnd('js', 6, done));
        });

        it('should add update existing items in cache if save=true', function (done) {
            array([makeFile('file-5.js', 'New file 2')])
                .pipe(cache('js'))
                .pipe(assert.length(6))
                .pipe(assert.end(function () {
                    cache.get('js').get('file-5.js').contents.toString().should.equal('New file 2');
                    done();
                }));
        });

        it('shouldn\'t update existing items in cache if save=false', function (done) {
            array([makeFile('file-5.js', 'New file 3')])
                .pipe(cache('js', false))
                .pipe(assert.length(6))
                .pipe(assert.end(function () {
                    cache.get('js').get('file-5.js').contents.toString().should.equal('New file 2');
                    done();
                }));
        });

        it('shouldn\'t update add new items in cache if save=false', function (done) {
            array([makeFile('file-6.js', 'New file')])
                .pipe(cache('js', false))
                .pipe(assert.length(6))
                .pipe(assertCacheLengthOnEnd('js', 6, done));
        });
    });

    describe('cache.save()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.save).should.throw();
        });

        it('should save new files to cache', function (done) {
            createStream(10)
                .pipe(cache.save('js2'))
                .pipe(assert.length(10))
                .pipe(assertCacheLengthOnEnd('js2', 10, done));
        });

        it('should update existing files to cache', function (done) {
            createStream(5)
                .pipe(cache.save('js2'))
                .pipe(assert.length(5))
                .pipe(assertCacheLengthOnEnd('js2', 10, done));
        });
    });

    describe('cache.forget()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.forget).should.throw();
        });

        it('should remove file existing file from cache', function () {
            cache.forget('js2', 'file-0.js');
            cache.get('js2').getFilePaths().length.should.not.containEql('file-0.js');
        });
    });

    describe('cache.update()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.update).should.throw();
        });

        it('should remove file if file has been deleted', function () {
            var evt = {
                path: 'file-1.js',
                type: 'deleted'
            };
            var fn = cache.update('js2');
            fn(evt);
            cache.get('js2').getFilePaths().length.should.not.containEql('file-1.js');
        });
    });

    describe('cache.lastUpdated()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.bind(cache.lastUpdated).should.throw();
        });
    });
});

function makeFile(path, contents) {
    return new File({
        path: path,
        contents: new Buffer(contents || 'what can I say? I create a function taking two arguments, and you don\'t even bother supplying the seconds one...')
    });
}

function createStream(numFiles) {
    var files = Array.apply(null, new Array(numFiles)).map(function (data, index) {
        return makeFile('file-' + index + '.js', 'File number ' + index);
    });

    return array(files);
}

function assertCacheLengthOnEnd(cacheName, length, done) {
    return assert.end(function () {
        cache.get(cacheName).getFilePaths().length.should.equal(length);
        done();
    });
}
