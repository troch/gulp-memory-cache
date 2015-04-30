[![Build Status](https://travis-ci.org/troch/gulp-memory-cache.svg?branch=master)](https://travis-ci.org/troch/gulp-memory-cache)
[![Coverage Status](https://coveralls.io/repos/troch/gulp-memory-cache/badge.svg)](https://coveralls.io/r/troch/gulp-memory-cache)

# gulp-memory-cache

A [gulp](https://github.com/gulpjs/gulp) plugin for caching files in memory to help with incremental building.
It is aimed for Gulp 4, see why: [Building with Gulp 4: Incremental builds](http://blog.reactandbethankful.com/).

## Usage

```javascript
var gulp   = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var cache  = require('gulp-memory-cache');

gulp.task('buildJs', function () {
    return gulp.src('src/**/*.js', {since: gulp.lastRun('buildJs')})
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


### cache.forget(name, filePath)

- `name` (required): the cache name
- `filePath` (required): the file path

Remove from cache `name` file with path `filePath`.

### cache.update(name)

- `name` (required): the cache name

To use in `watch.on('change', ...)` in order to avoid boilerplate code. It will automatically remove files which have
been deleted from cache `name`.

### cache.lastUpdated(name)

- `name` (required): the cache name

Returns the last time a cache was updated, can be used in lieu of `gulp.lastRun()`.

### cache.get(name)

- `name` (optional): the cache name

Return cache named `name`, or all cached data if `name` is not supplied.
