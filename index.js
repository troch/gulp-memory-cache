var through = require('through2');
var Cache   = require('./cache');

module.exports              = saveAndRetrieveFromCache;
module.exports.save         = saveToCache;
module.exports.forget       = removeFromCache;
module.exports.update       = updateFromEvent;
module.exports.lastUpdated  = lastUpdated;
module.exports.get          = getCache;

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
        cb(null, file);
    });
}

/**
 * Save to cache (optional) and add back all files in cache
 */
function saveAndRetrieveFromCache(cacheName, save) {
    // By default save to cache
    save = save === undefined ? true : !!save;
    if (!cacheName) {
        throw new Error('[gulp-memory-cache] No cache name was supplied');
    }

    if (!cache[cacheName]) {
        // TODO: compression option
        cache[cacheName] = new Cache();
    }

    function saveOrIgnore(file, enc, cb) {
        if (save) {
            cache[cacheName].save(file);
        }
        cb();
    }

    function addFilesFromCache(cb) {
        var self = this;
        // Add all files from cache
        cache[cacheName].getFilePaths().forEach(function (filePath) {
            self.push(cache[cacheName].get(filePath))
        });
        cb();
    }

    return through.obj(saveOrIgnore, addFilesFromCache);
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
    if (!cacheName) {
        throw new Error('[gulp-memory-cache] No cache name was supplied when calling cache.update()');
    }

    return function (evt) {
        if (evt.type === 'deleted') {
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

/**
 * Get cache
 */
function getCache(cacheName) {
    return cacheName === undefined ? cache : cache[cacheName];
}
