var through = require('through2');
var Cache   = require('./cache');

module.exports              = retrieveFromCache;
module.exports.save         = saveToCache;
module.exports.forget       = removeFromCache;
module.exports.update       = updateFromEvent;
module.exports.lastUpdated  = lastUpdated;

var cache = {};

/**
 * Save to cache files
 */
function saveToCache(cacheName, compress) {
    if (!cacheName) {
        throw new Error('[gulp-memory-cache] No cache name to save to was supplied');
    }

    if (!cache[cacheName]) {
        // TODO: compression option
        cache[cacheName] = new Cache();
    }

    return through.obj(function (file, enc, cb) {
        if (file.isStream()) {
            throw new Error('[gulp-memory-cache] Streams are not supported. Use buffered contents instead.');
        }

        cache[cacheName].save(file);
        cb();
    });
}

/**
 * Save to cache (optional) and add back all files in cache
 */
function retrieveFromCache(cacheName, update) {
    // By default update cache
    update = update === undefined ? true : !!update;
    if (!cacheName) {
        throw new Error('[gulp-memory-cache] No cache name was supplied');
    }

    if (!cache[cacheName]) {
        throw new Error('[gulp-memory-cache] No cache with name ' + cacheName + ' was found');
    }

    function ignoreOrUpdate(file, enc, cb) {
        if (update) {
            cache[cacheName].save(file);
        }
        cb();
    }

    function addFiles(cb) {
        // Add all files from cache
        cache[cacheName].getFilePaths().forEach(function (filePath) {
            this.push(cache[cacheName].get(filePath))
        });
    }

    return through.obj(ignoreOrUpdate, addFiles);
}

/**
 * Remove file from cache
 */
function removeFromCache(cacheName, filePath) {
    if (!cacheName) {
        throw new Error('[gulp-memory-cache] No cache name to remove from was supplied');
    }

    if (!filePath) {
        throw new Error('[gulp-memory-cache] No cache name to retrieve was supplied');
    }

    cache[cacheName].remove(filePath);
}

/**
 * Remove file on change
 */
function updateFromEvent(cacheName) {
    return function (evt) {
        if (event.type === 'deleted') {
            removeFromCache(cacheName, evt.path);
        }
        // TODO: clever insersion in cache to preserve natural file order?
    };
}

/**
 * Get last time a cache was updated
 */
function lastUpdated(cacheName, timestamp) {
    if (timestamp === undefined) {
        return cache[cacheName].lastUpdated;
    }
    cache[cacheName].lastUpdated = timestamp;
};
