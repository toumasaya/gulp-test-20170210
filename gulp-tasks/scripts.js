module.exports = function(gulp, plugins) {
  return () => {
    const bundler = plugins.browserify({
      entries: 'app/js/app.js',
      debug: true
    });

    bundler.transform(plugins.babelify);

    bundler.bundle()
      .on('error', function(err) { console.error(err) })
      .pipe(plugins.source('app.js'))
      .pipe(plugins.buffer())
      .pipe(plugins.sourcemaps.init({ loadMaps: true }))
      .pipe(plugins.uglify())
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/js'))
      .pipe(plugins.notify({message: `js task: ${"<%= file.path %>"}`}))
  }
}
