import gulp from 'gulp';
// server
import browserSync from 'browser-sync';

// pug
import pug from 'gulp-pug';
import pugInheritance from 'gulp-pug-inheritance';

// tool
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import del from 'del';
import changed from 'gulp-changed';
import cached from 'gulp-cached';
import filter from 'gulp-filter';
import gulpIf from 'gulp-if';
import debug from 'gulp-debug';
import runSequence from 'run-sequence';

// variable
const paths = {
  pugs: 'app/pug/**/*.pug'
}

const filePath = "<%= file.path %>";

// browser-sync
gulp.task('browserSync', () => {
  browserSync.create();
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
})

// pug
gulp.task('pug', () => {
  return gulp.src(paths.pugs)
    .pipe(plumber())
    // only pass unchanged *main* files and *all* the partials
    .pipe(changed('dist', {extension: '.html'}))
    .pipe(debug({title: 'pug-debug-changed'}))
    // filter out unchanged partials, but it only works when watching
    .pipe(gulpIf(global.isWatching, cached('pug')))
    .pipe(debug({title: 'pug-debug-cached'}))
    // find files that depend on the files that have changed
    .pipe(pugInheritance({basedir: 'app/pug', extension: '.pug', skip: 'node_modules'}))
    .pipe(debug({title: 'pug-debug-inheritance'}))
    // filter out partials (folders and files starting with "_" )
    .pipe(filter(function(file) {
      return !/\/_/.test(file.path) && !/^_/.test(file.relative);
    }))
    .pipe(debug({title: 'pug-debug-filter'}))
    // process pug templates
    .pipe(pug({pretty: true}))
    //save all the files
    .pipe(gulp.dest('dist/'))
    // when task finish show notify
    .pipe(notify({message: `pug task: ${filePath}`}))
    .pipe(browserSync.reload({stream: true}))
})

gulp.task('setWatch', () => {
  global.isWatching = true;
});

gulp.task('watch', ['browserSync', 'setWatch', 'pug'], () => {
  gulp.watch(paths.pugs, ['pug']);
});

gulp.task('clean:dist', () => {
  del.sync('dist/')
});

gulp.task('build', () => {
  runSequence('clean:dist', ['pug']);
});

gulp.task('default', () => {
  runSequence(['pug', 'browserSync', 'watch'])
});
