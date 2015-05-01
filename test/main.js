'use strict';

var cache    = require('../');
var Cache    = require('../cache');
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
            cache.save.bind(cache).should.throw();
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
            cache.forget.bind(cache).should.throw();
        });

        it('should remove file existing file from cache', function () {
            cache.forget('js2', 'file-0.js');
            cache.get('js2').getFilePaths().should.not.containEql('file-0.js');
        });

        it ('should not throw an error when removing a file which is not in cache', function () {
            cache.forget.bind(cache, 'js2', 'file-undefined.js').should.not.throw();
        });
    });

    describe('cache.update()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.update.bind(cache).should.throw();
        });

        it('should remove file if file has been deleted', function () {
            var evt = {
                path: 'file-1.js',
                type: 'deleted'
            };
            var fn = cache.update('js2');
            fn(evt);
            cache.get('js2').getFilePaths().should.not.containEql('file-1.js');
        });

        it('should not remove file if event is not of type deleted', function () {
            var evt = {
                path: 'file-2.js',
                type: 'hello'
            };
            var fn = cache.update('js2');
            fn(evt);
            cache.get('js2').getFilePaths().should.containEql('file-2.js');
        });
    });

    describe('cache.lastUpdated()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.lastUpdated.bind(cache).should.throw();
        });

        it('should return undefined if cache doesn\'t exist', function () {
            should.not.exist(cache.get('cache-cache'));
            should.not.exist(cache.lastUpdated('cache-cache'));
        });

        it('should throw an exception if cache name doesn\'t exist when trying to update lastUpdated', function () {
            cache.lastUpdated.bind(cache, 'cache-cache', Date.now()).should.throw();
        });

        it('should set last updated if timestamp is supplied', function () {
            var timestamp = Date.now();
            cache.lastUpdated('js2', timestamp);
            cache.lastUpdated('js2').should.equal(timestamp);
        });
    });

    describe('cache.lastMtime()', function () {
        it('should throw an exception if no cache name is supplied', function () {
            cache.lastMtime.bind(cache).should.throw();
        });

        it('should throw an exception if cache doesn\'t exist', function () {
            cache.lastMtime.bind(cache, 'cache-cache').should.throw();
        });

        it('should return undefined if no mtimes', function () {
            should.not.exists(cache.lastMtime('js2'));
        });

        it('should return most recent modified time', function () {
            var mtimeBase = Date.now();
            createStream(10, mtimeBase)
                .pipe(cache.save('js2'))
                .pipe(assert.end(function () {
                    cache.lastMtime('js2').should.be(mtimeBase + 9 * 1000);

                    // Update
                    createStream(1, mtimeBase + 10 * 1000)
                        .pipe(cache.save('js2'))
                        .pipe(assert.end(function () {
                            cache.lastMtime('js2').should.be(mtimeBase + 10 * 1000);
                            done();
                        }));
                }));
        });
    });

    describe('cache.get()', function () {
        it('should return full cache object if no cache name is supplied', function () {
            cache.get().should.have.property('js');
            cache.get().should.have.property('js2');
        });

        it('should return a cache object if cache exisits', function () {
            cache.get('js').should.be.an.instanceOf(Cache);
        })

        it('should return undefined if cache doesn\'t exist', function () {
            should.not.exist(cache.get('cache-cache'));
        });
    });
});

function makeFile(path, contents, mtime) {
    var stat = mtime ? {mtime: mtime} : undefined;
    return new File({
        path: path,
        contents: new Buffer(contents || 'what can I say? I create a function taking two arguments, and you don\'t even bother supplying the seconds one...'),
        stat: stat
    });
}

function createStream(numFiles, mtimeBase) {
    var files = Array.apply(null, new Array(numFiles)).map(function (data, index) {
        var mtime = mtimeBase ? mtimeBase + index * 1000 : false;
        return makeFile('file-' + index + '.js', 'File number ' + index, mtime);
    });

    return array(files);
}

function assertCacheLengthOnEnd(cacheName, length, done) {
    return assert.end(function () {
        cache.get(cacheName).getFilePaths().length.should.equal(length);
        done();
    });
}
