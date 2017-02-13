module.exports = function(gulp, plugins) {
  return () => {
    return gulp.src('app/sass/**/*.{sass,scss}')
      .pipe(plugins.plumber())
      //filter out unchanged scss files, only works when watching
      .pipe(plugins.gulpIf(global.isWatching, plugins.cached('sass')))
      .pipe(plugins.debug({title: 'sass-debug-cached'}))
      // remember sass
      .pipe(plugins.remember('sass'))
      .pipe(plugins.debug({title: 'sass-debug-remember'}))
      //find files that depend on the files that have changed
      .pipe(plugins.sassInheritance({dir: 'app/sass/'}))
      .pipe(plugins.debug({title: 'sass-debug-inheritance'}))
      // source maps init
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.debug({title: 'sass-debug-sourcemaps-before'}))
      //process scss files
      .pipe(plugins.sass.sync())
      .pipe(plugins.cssnano({
        zindex: false // fixed the z-index bug
      }))
      // source maps write
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(plugins.debug({title: 'sass-debug-sourcemaps-after'}))
      //save all the files
      .pipe(gulp.dest('dist/css/'))
      // when task finish show notify
      .pipe(plugins.notify({message: `sass task: ${"<%= file.path %>"}`}))
      .pipe(plugins.browserSync.reload({stream: true}))
  }
}
