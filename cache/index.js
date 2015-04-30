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

    this.remove = function (filePath) {
        if (this.cache[filePath]) {
            delete this.cache[filePath];
            this.updateLastUpdated();
        }
    };
}
