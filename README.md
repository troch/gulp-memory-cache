# This is a draft

# gulp-memory-cache

A [gulp](https://github.com/gulpjs/gulp) plugin for caching files in memory to help with incremental building.
It is aimed for Gulp 4, see why: [Building with Gulp 4: Incremental builds](http://blog.reactandbethankful/).

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

### cache(name, update)

- `name` (required): the cache name
- `update` (optional, default to `true`): whether or not to update cache

If `update` is truthy, it will saves streamed files to cache with name `name`.
`cache()` then returns a stream containing all files in cache in the order they appeared.

### cache.save(name)

- `name` (required): the cache name

Saves streamed files to cache with name `name`. Useful if you want to save
in a pipeline for retrieving later (in the same or another pipeline).


### cache.forget(name, filePath)

- `name` (required): the cache name
- `filePath` (required): the file path

Remove from cache `name` file with path `filePath`.

### cache.update(name, event)

- `name` (required): the cache name
- `event` (required): a watch event

To use in `watch.on('change', ...)` in order to avoid boilerplate code.

### cache.lastUpdated(name)

- `name` (required): the cache name

Returns the last time a cache was updated, can be used in lieu of `gulp.lastRun()`.
