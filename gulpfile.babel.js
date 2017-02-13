import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

// variables
// -----------------
// gulp-load-plugins setting
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-sass-multi-inheritance': 'sassInheritance',
    'vinyl-buffer': 'buffer',
    'vinyl-source-stream': 'source',
    'imagemin-pngquant': 'pngquant',
    'gulp-if': 'gulpIf',
  },
  pattern: '*'
});

// paths
const paths = {
  css: 'dist/css/*.css',
  image: 'app/images/*.+(jpg|png|svg)',
  script: 'app/js/*.js',
  pugs: 'app/pug/**/*.pug',
  sass: 'app/sass/**/*.+(sass|scss)'
}

const reload = plugins.browserSync.reload;

// Development tasks
// -----------------
function getTask(task) {
  return require(`./gulp-tasks/${task}`)(gulp, plugins);
}

// browser-sync
gulp.task('browserSync', () => {
  plugins.browserSync.create();
  plugins.browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
})

gulp.task('pug', getTask('pug'));
gulp.task('sass', getTask('sass'));
gulp.task('scripts', getTask('scripts'));
gulp.task('img', getTask('img'));

gulp.task('clean:dist', () => {
  plugins.del.sync('dist/')
});

// Watchers
// ------------------
gulp.task('setWatch', () => {
  global.isWatching = true;
});

gulp.task('watch', ['browserSync', 'setWatch', 'pug', 'sass', 'img', 'scripts'], () => {
  gulp.watch(paths.css).on('change', reload);
  gulp.watch(paths.image, ['img']);
  gulp.watch(paths.script, ['scripts']).on('change', reload);
  gulp.watch(paths.pugs, ['pug']);
  gulp.watch(paths.sass, ['sass']);
});

// Build Sequence
// -------------------
gulp.task('build', () => {
  plugins.runSequence('clean:dist', ['pug', 'sass', 'img', 'scripts']);
});

gulp.task('default', () => {
  plugins.runSequence(['pug', 'sass', 'img', 'scripts','browserSync', 'watch'])
});
