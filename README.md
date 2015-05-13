[![npm version](https://badge.fury.io/js/gulp-memory-cache.svg)](http://badge.fury.io/js/gulp-memory-cache)
[![Build Status](https://travis-ci.org/troch/gulp-memory-cache.svg?branch=master)](https://travis-ci.org/troch/gulp-memory-cache)
[![Coverage Status](https://coveralls.io/repos/troch/gulp-memory-cache/badge.svg)](https://coveralls.io/r/troch/gulp-memory-cache)

# gulp-memory-cache

A [gulp](https://github.com/gulpjs/gulp) plugin for caching files in memory to help with incremental building.

It is aimed to be used with Gulp 4, see why: [Building with Gulp 4: Incremental builds](http://blog.reactandbethankful.com/posts/2015/05/01/building-with-gulp-4-part-4-incremental-builds/).

If you are using Gulp 3, you will need to use `gulp-memory-cache` in combination with [`gulp-cached`](https://npmjs.com/package/gulp-cached) or similar.
However be aware that both modules will maintain their own cache and therefore files are cached twice.

## Usage

```javascript
var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var cache  = require('gulp-memory-cache');

gulp.task('buildJs', function () {
    return gulp.src('src/**/*.js', {since: cache.lastMtime('js')})
        .pipe(jshint())
        .pipe(cache('js'))
        .pipe(concat('app.js'))
        .pipe(dest('build'));
});

gulp.task('watch', function () {
    gulp.watch('src/**/*.js', gulp.series('buildJs'))
        .on('change', cache.update('js'));
});

gulp.task('build', gulp.series('buildJs', 'watch'));
```


## API

### cache(name, save)

- `name` (required): the cache name
- `save` (optional, default to `true`): whether or not to save / update cache

If `save` is truthy, it will save (update) streamed files to cache with name `name`.
`cache()` then returns a stream containing all files in cache in the order they were added.

### cache.save(name)

- `name` (required): the cache name

Saves streamed files to cache with name `name`. Useful if you want to save
in a pipeline for retrieving later (in the same or another pipeline).


### cache.forget(name, filePath[, fn])

- `name` (required): the cache name
- `filePath` (required): the file path
- `fn`: a file path transformation function

Remove from cache `name` file with path `filePath`. `fn` is a file path transformation function (see below for
an example with `cache.update()`.

### cache.update(name[, fn])

- `name` (required): the cache name
- `fn`: a file path transformation function

To use in `watch.on('change', ...)` in order to avoid boilerplate code. It will automatically remove files which have
been deleted from cache `name`. `fn` is a function to transform a file path and can be useful for removing
a file from cache which name has been altered by a gulp plugin.

```
gulp.watch('src/**/*.tpl.html', gulp.series('bundlePartials'))
    .on('change', cache.update('partials', function (filePath) {
        return filePath.replace(/.html$/, '.js')
    }));
```

### cache.lastMtime(name)

- `name` (required): the cache name

Returns the most recent mtime (modified time) of all files in specified cache, can be used in lieu of `gulp.lastRun()`.

### cache.lastUpdated(name)

- `name` (required): the cache name

Returns the last time a cache was updated, can also be used in lieu of `gulp.lastRun()`.

### cache.get(name)

- `name` (optional): the cache name

Return cache named `name`, or all cached data if `name` is not supplied.


## Cache API

`cache.get(cacheName)` returns a [Cache](https://github.com/troch/gulp-memory-cache/blob/master/lib/cache.js) object.
