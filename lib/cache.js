module.exports = Cache;

function Cache(compression) {
    this.compression = compression || false;
    this.cache = {};

    this.lastUpdated = undefined;

    this.updateLastUpdated = function () {
        this.lastUpdated = Date.now();
    };

    this.save = function (file) {
        this.cache[file.path] = file;
        this.updateLastUpdated();
    };

    this.get = function (filePath) {
        return this.cache[filePath]
    };

    this.getFilePaths = function (filePath) {
        return Object.keys(this.cache);
    };

    this.flush = function () {
        this.cache = {};
    }

    this.remove = function (filePath) {
        if (this.cache[filePath]) {
            delete this.cache[filePath];
            this.updateLastUpdated();
        }
    };

    this.getMtime = function (filePath) {
        var file = this.get(filePath);
        return file && file.stat ? file.stat.mtime : undefined;
    };

    this.getMostRecentMtime = function () {
        var self = this;

        var mtimes =this.getFilePaths()
            .map(function (filePath) {
                return self.getMtime(filePath);
            })
            .filter(function (mtime) {
                return mtime !== undefined;
            });

        if (mtimes.length === 0) {
            return undefined;
        }

        return mtimes.reduce(function (max, mtime) {
            return mtime > max ? mtime : max;
        });
    };
}
