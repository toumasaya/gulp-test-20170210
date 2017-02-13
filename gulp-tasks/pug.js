module.exports = function(gulp, plugins) {
  return () => {
    return gulp.src('app/pug/**/*.pug')
      .pipe(plugins.plumber())
      // only pass unchanged *main* files and *all* the partials
      .pipe(plugins.changed('dist', {extension: '.html'}))
      .pipe(plugins.debug({title: 'pug-debug-changed'}))
      // filter out unchanged partials, but it only works when watching
      .pipe(plugins.gulpIf(global.isWatching, plugins.cached('pug')))
      .pipe(plugins.debug({title: 'pug-debug-cached'}))
      // find files that depend on the files that have changed
      .pipe(plugins.pugInheritance({basedir: 'app/pug', extension: '.pug', skip: 'node_modules'}))
      .pipe(plugins.debug({title: 'pug-debug-inheritance'}))
      // filter out partials (folders and files starting with "_" )
      .pipe(plugins.filter(function(file) {
        return !/\/_/.test(file.path) && !/^_/.test(file.relative);
      }))
      .pipe(plugins.debug({title: 'pug-debug-filter'}))
      // process pug templates
      .pipe(plugins.pug({pretty: true}))
      //save all the files
      .pipe(gulp.dest('dist/'))
      // when task finish show notify
      .pipe(plugins.notify({message: `pug task: ${"<%= file.path %>"}`}))
      .pipe(plugins.browserSync.reload({stream: true}))
  }
}
