module.exports = function(gulp, plugins) {
  return () => {
    return gulp.src('app/images/*.{jpg,png,svg}')
      .pipe(plugins.cached(plugins.imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [plugins.pngquant()]
      })))
      .pipe(gulp.dest('dist/images'))
      .pipe(plugins.notify({message: `img task: ${"<%= file.path %>"}`}))
  }
}
