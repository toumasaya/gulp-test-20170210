# Gulp test - 20170210

# 前置作業

根據 https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md

把之前的全域 Gulp 移除：`npm rm --global gulp`
裝上：`npm install --global gulp-cli`

得到：

```shell
$ gulp -v

CLI version 1.2.2
```

# 建立專案

## 基本設定

建立資料夾並且進入：

```shell
$ mkdir gulp-test-20170210 && cd gulp-test-20170210
```

初始化 npm：

```shell
$ npm init
```

初始化 git：

```shell
$ git init
```

建立 `.gitignore` 和 `gulpfile.babel.js`：

```shell
$ touch .gitignore
$ touch gulpfile.babel.js
```

在 `.gitignore` 加上要忽略的檔案：

```
# DS_Store
.DS_Store
app/.DS_Store

# Logs
*.log
logs

# Dependency directories
node_modules

# sass cache
.sass-cache/
*.css.map
```

提交：

```shell
$ git add -A
$ git commit -m "First commit"
```

## 安裝 Gulp 和 babel

安裝 `gulp`：

```shell
$ npm install --save-dev gulp
```

因為要用 ES6 寫 gulpfile，所以要安裝相關套件，Babel 基本教學可以參考 [Babel 入门教程](http://www.ruanyifeng.com/blog/2016/01/babel.html)。

安裝 `babel-preset-es2015`：

```shell
$ npm install --save-dev babel-preset-es2015
```

建立 `.babelrc` 設定文件：

```shell
$ touch .babelrc
```

在 `.babelrc` 加上：

```
{
  "presets": ["es2015"]
}
```

### hello task 測試

寫個 `hello` task 來測試，在 `gulpfile.babel.js`：

```javascript
import gulp from 'gulp';

gulp.task('hello', () => {
  console.log('Hello Gulp!')
});
```

執行：`gulp hello`

出現錯誤：

```shell
[22:12:12] Failed to load external module babel-register
[22:12:12] Failed to load external module babel-core/register
[22:12:12] Failed to load external module babel/register
/Users/Salt/Workspace/gulp/gulp-test-20170210/gulpfile.babel.js:1
(function (exports, require, module, __filename, __dirname) { import gulp from 'gulp';
                                                              ^^^^^^
SyntaxError: Unexpected token import
```

### 安裝 babel-core 和 babel-register

剛剛是在測試只裝 `babel-preset-es2015` 的結果，所以看來要連同 `babel-core`、`babel-register` 一起安裝：

安裝 `babel-core`、`babel-register`：

```shell
$ npm install --save-dev babel-core babel-register
```

再次執行： `gulp hello`

似乎成功運作，但總是會出現：`Requiring external module babel-register`

```shell
$ gulp hello

[22:17:12] Requiring external module babel-register
[22:17:12] Using gulpfile ~/Workspace/gulp/gulp-test-20170210/gulpfile.babel.js
[22:17:12] Starting 'hello'...
Hello Gulp!
[22:17:12] Finished 'hello' after 134 μs
```

查了一下應該不是錯誤：https://github.com/gulpjs/gulp/issues/1631

既然 gulp 可以運作，應該就沒問題。

> 其實我是先安裝 `babel-core`，但還是出現錯誤，再接著裝 `babel-register` 就沒問題了

# Pug

來測試 pug。

## 安裝 browser-sync

安裝 `browser-sync`，讓瀏覽器可以同步更新畫面：

```shell
$ npm install --save-dev browser-sync
```

在 `gulpfile.babel.js` 加上：

```javascript
import browserSync from 'browser-sync';

// browser-sync
gulp.task('browserSync', () => {
  browserSync.create();
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
})
```

## 設定、安裝 pug 相關套件

### 安裝 pug 相關套件

* gulp-pug
* gulp-pug-inheritance
* gulp-cached
* gulp-changed
* gulp-filter
* gulp-if
* gulp-debug
* gulp-notify
* gulp-plumber
* del

```shell
$ npm install --save-dev gulp-pug gulp-pug-inheritance gulp-cached gulp-changed gulp-filter gulp-if gulp-debug  gulp-notify gulp-plumber del
```

### 設定 `pug` task

```javascript
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

// variable
const paths = {
  pugs: 'app/pug/**/*.pug'
}

const filePath = "<%= file.path %>";

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
```

### 設定監聽任務

```javascript
gulp.task('setWatch', () => {
  global.isWatching = true;
});

gulp.task('watch', ['browserSync', 'setWatch', 'pug'], () => {
  gulp.watch(paths.pugs, ['pug']);
});
```

為了防止 partial 檔案被處理輸出成 html，要在檔名前面加個 `_` ，或是在父層資料夾名稱加個 `_`：

```
/app/index.pug
/app/_header.pug
/app/_partials/article.pug
/dist/
```

詳情可以參考：https://www.npmjs.com/package/gulp-pug-inheritance

### 安裝 run-sequence

為了要讓任務可以依次執行，安裝 `run-sequence`：

```shell
$ npm install --save-dev run-sequence
```

設定 `build` `default` `clean:dist` task：

```javascript
gulp.task('clean:dist', () => {
  del.sync('dist/')
});

gulp.task('build', () => {
  runSequence('clean:dist', ['pug']);
});

gulp.task('default', () => {
  runSequence(['pug', 'browserSync', 'watch'])
});
```

# Sass

來測試 sass。

Sass 跟 Pug 一樣會有繼承問題要處理，找到 `gulp-sass-multi-inheritance` 套件來處理。

詳情可以參考：https://www.npmjs.com/package/gulp-sass-multi-inheritance

## 使用 gulp-sass-multi-inheritance - 先按照官方指示處理

安裝相關套件：

* gulp-sass
* gulp-sass-multi-inheritance
* gulp-cached（前面已安裝）
* gulp-if（前面已安裝）

```shell
$ npm install --save-dev gulp-sass gulp-sass-multi-inheritance
```

設定 `sass` task，除了按照官方指示，也加上 debug 以便了解任務流程：

```javascript
// sass
import sass from 'gulp-sass';
import sassInheritance from 'gulp-sass-multi-inheritance';

// variable
const paths = {
  pugs: 'app/pug/**/*.pug',
  sass: 'app/sass/**/*.+(sass|scss)'
}

// Sass
gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(plumber())
    //filter out unchanged scss files, only works when watching
    .pipe(gulpIf(global.isWatching, cached('sass')))
    .pipe(debug({title: 'sass-debug-cached'}))
    //find files that depend on the files that have changed
    .pipe(sassInheritance({dir: 'app/sass/'}))
    .pipe(debug({title: 'sass-debug-inheritance'}))
    //process scss files
    .pipe(sass.sync())
    //save all the files
    .pipe(gulp.dest('dist/css/'))
    // when task finish show notify
    .pipe(notify({message: `sass task: ${filePath}`}))
    .pipe(browserSync.reload({stream: true}))
})
```

`.pipe(plumber())` 可以讓錯誤訊息拋出時，仍然繼續在 console 運作，不會離開，如果沒有 plumber，整個會被強制離開 console。

`.pipe(sass.sync())` 可以在出現錯誤訊息時，依舊繼續運作 task。
如果只有 `.pipe(sass())` ，出現錯誤會停止運作 task，然後就會一直卡在錯誤訊息不會動，除非你離開 console。

所以 `plumber()` + `sass.sync()` 是比較好的結合。

在 `watch` `build` `default` 加上 `sass` task：

```javascript
gulp.task('watch', ['browserSync', 'setWatch', 'pug', 'sass'], () => {
  gulp.watch(paths.pugs, ['pug']);
  gulp.watch(paths.sass, ['sass']);
});

gulp.task('build', () => {
  runSequence('clean:dist', ['pug', 'sass']);
});

gulp.task('default', () => {
  runSequence(['pug', 'sass', 'browserSync', 'watch'])
});
```

測試目錄為：

```
app/
 |-- sass/
   |-- main.sass
   |-- partials/
     |-- _header.sass
     |-- _footer.sass
```

在 `main.sass` ：

```sass
@import partials/header
@import partials/footer

h1
  color: #ccc
```

測試結果看起來沒什麼問題。才怪。

當如果改變 partial 檔案，例如 `_header.sass` 變更之後，最後並沒有偵測到 `main.css` 的改變。

## 安裝 gulp-remember

為了解決上面的問題，安裝 `gulp-remember`：

```shell
$ npm install --save-dev gulp-remember
```

設定 `sass` task：

```javascript
import remember from 'gulp-remember';

// Sass
gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(plumber())
    //filter out unchanged scss files, only works when watching
    .pipe(gulpIf(global.isWatching, cached('sass')))
    .pipe(debug({title: 'sass-debug-cached'}))
    // remember
    .pipe(remember('sass'))
    .pipe(debug({title: 'sass-debug-remember'}))
    //find files that depend on the files that have changed
    .pipe(sassInheritance({dir: 'app/sass/'}))
    .pipe(debug({title: 'sass-debug-inheritance'}))
    //process scss files
    .pipe(sass.sync())
    //save all the files
    .pipe(gulp.dest('dist/css/'))
    // when task finish show notify
    .pipe(notify({message: `sass task: ${filePath}`}))
    .pipe(browserSync.reload({stream: true}))
})
```

再次測試，似乎是沒什麼問題了。

## gulp-changed, gulp-cached, gulp-remember, gulp-newer

有關這四個套件，可以參考：[Gulp中的增量编译](http://fedvic.com/2016/01/29/gulpIncrementalBuild/)

## 增加 sourcemaps

詳情可以參考：
* https://www.npmjs.com/package/gulp-sourcemaps
* [Source Map(原始碼映射表)](http://eddychang.me/blog/javascript/76-source-map.html)

安裝 `gulp-sourcemaps`：

```shell
$ npm install --save-dev gulp-sourcemaps
```

設定 sourcesmaps：

```javascript
// file tool
import sourcemaps from 'gulp-sourcemaps';

// Sass
gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(plumber())
    //filter out unchanged scss files, only works when watching
    .pipe(gulpIf(global.isWatching, cached('sass')))
    .pipe(debug({title: 'sass-debug-cached'}))
    // remember
    .pipe(remember('sass'))
    .pipe(debug({title: 'sass-debug-remember'}))
    //find files that depend on the files that have changed
    .pipe(sassInheritance({dir: 'app/sass/'}))
    .pipe(debug({title: 'sass-debug-inheritance'}))
    // source maps init
    .pipe(sourcemaps.init())
    .pipe(debug({title: 'sass-debug-sourcemaps-before'}))
    //process scss files
    .pipe(sass.sync())
    // source maps write
    .pipe(sourcemaps.write('.'))
    .pipe(debug({title: 'sass-debug-sourcemaps-after'}))
    //save all the files
    .pipe(gulp.dest('dist/css/'))
    // when task finish show notify
    .pipe(notify({message: `sass task: ${filePath}`}))
    .pipe(browserSync.reload({stream: true}))
})
```

把需要產生 source maps 的 task 包在 `sourcemaps.init()` 和 `sourcemaps.write()` 之間。

### 產生 inline source maps

在來源檔案底下產生 inline source maps：

```
sourcemaps.write()
```

這樣就會在 `main.css` 底下產生：

```css
.header h1 {
  color: blue; }

.footer h1 {
  color: pink; }

h1 {
  color: #ccc; }

/*# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5jc3MiLCJzb3VyY2VzIjpbIm1haW4uc2FzcyIsInBhcnRpYWxzL19oZWFkZXIuc2FzcyIsInBhcnRpYWxzL19mb290ZXIuc2FzcyJdLCJzb3VyY2VzQ29udGVudCI6WyJAaW1wb3J0IFwicGFydGlhbHMvaGVhZGVyXCI7XG5AaW1wb3J0IFwicGFydGlhbHMvZm9vdGVyXCI7XG5cbmgxIHtcbiAgY29sb3I6ICNjY2M7IH1cbiIsIi5oZWFkZXIge1xuICBoMSB7XG4gICAgY29sb3I6IGJsdWU7IH0gfVxuIiwiLmZvb3RlciB7XG4gIGgxIHtcbiAgICBjb2xvcjogcGluazsgfSB9XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFDQUEsQUFDRSxPQURLLENBQ0wsRUFBRSxDQUFDO0VBQ0QsS0FBSyxFQUFFLElBQUksR0FBSTs7QUNGbkIsQUFDRSxPQURLLENBQ0wsRUFBRSxDQUFDO0VBQ0QsS0FBSyxFQUFFLElBQUksR0FBSTs7QUZDbkIsQUFBQSxFQUFFLENBQUM7RUFDRCxLQUFLLEVBQUUsSUFBSSxHQUFJIn0= */
```

### 另外產生一份檔案

```javascript
// 在 css/ 底下產生
sourcemaps.write('.')
// or 指定一個資料夾
sourcemaps.write('./maps')
```

這樣會在 `dist/css/` 資料夾產生：

```
css/main.css.map
css/maps/main.css.map
```

### source maps 的作用：

想要查詢 element 的原始 sass 寫在哪一份，可以看到它指向到 `_header.sass:2`

![](https://i.imgur.com/a7ZwK6I.png)

點進去看就可以看到 `_header.sass` 的程式碼：

![](https://i.imgur.com/zsUflgH.png)

## 使用 Bower 來安裝框架

透過 Bower 可以安裝一些專案需要的框架，例如 Susy、jQuery 等等。

### 在專案設定 Bower

在專案根目錄底下初始化 Bower：

```shell
$ bower init
```

`bower init` 會產生一個 `bower.json` 檔案，裡面會記錄你安裝套件的資訊。

安裝套件：

```shell
$ bower install <plugin_name> --save
```

`--save` 指令是讓套件資訊存進 `bower.json`，如果沒有這個指令 `bower.json` 就不會紀錄。

安裝完之後，你會在專案目錄下看到一個 `bower_componnents` 資料夾，裡面就會放你安裝的所有套件。

在 `.gitignore` 加上忽略 `bower_componnents` 資料夾。

### 安裝 Susy

安裝 `susy`：

```shell
$ bower install susy --save
```

安裝 `breakpoint-sass`：

```shell
$ bower install breakpoint-sass --save
```

在 `main.sass` import 這兩個檔案：

```sass
@import ./bower_components/susy/sass/susy
@import ./bower_components/breakpoint-sass/stylesheets/breakpoint
```

測試後沒什麼問題。

## 壓縮 css

詳情可以參考：
* https://www.npmjs.com/package/gulp-cssnano
* [Sass Workflow Using cssnano and Autoprefixer](http://jimfrenette.com/2016/02/sass-cssnano-autoprefixer/)


使用 `gulp-cssnano` 壓縮 css，安裝：

```shell
$ npm install --save-dev gulp-cssnano
```

在 `.pipe(sass.sync())` 後面加上：`.pipe(cssnano({
      zindex: false
    }))` ：

```javascript
// file tool
import cssnano from 'gulp-cssnano';

// Sass
gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(plumber())
    //filter out unchanged scss files, only works when watching
    .pipe(gulpIf(global.isWatching, cached('sass')))
    .pipe(debug({title: 'sass-debug-cached'}))
    // remember
    .pipe(remember('sass'))
    .pipe(debug({title: 'sass-debug-remember'}))
    //find files that depend on the files that have changed
    .pipe(sassInheritance({dir: 'app/sass/'}))
    .pipe(debug({title: 'sass-debug-inheritance'}))
    // source maps init
    .pipe(sourcemaps.init())
    .pipe(debug({title: 'sass-debug-sourcemaps-before'}))
    //process scss files
    .pipe(sass.sync())
    .pipe(cssnano({
      zindex: false // fixed the z-index bug
    }))
    // source maps write
    .pipe(sourcemaps.write('.'))
    .pipe(debug({title: 'sass-debug-sourcemaps-after'}))
    //save all the files
    .pipe(gulp.dest('dist/css/'))
    // when task finish show notify
    .pipe(notify({message: `sass task: ${filePath}`}))
    .pipe(browserSync.reload({stream: true}))
})
```

設定 `watch` task，監聽當 `dist/css` 裡面的檔案變更時，reload browser：

```javascript
gulp.task('watch', ['browserSync', 'setWatch', 'pug', 'sass'], () => {
  gulp.watch(paths.pugs, ['pug']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch('dist/css/main.css').on('change', browserSync.reload);
});
```

可以把 `dist/css/main.css` 存成變數：

```javascript
const paths = {
  pugs: 'app/pug/**/*.pug',
  sass: 'app/sass/**/*.+(sass|scss)',
  css: 'dist/css/*.css'
}

gulp.task('watch', ['browserSync', 'setWatch', 'pug', 'sass'], () => {
  gulp.watch(paths.pugs, ['pug']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.css).on('change', browserSync.reload);
});
```

# Javascript

安裝套件：

* babelify
* browserify
* vinyl-buffer
* vinyl-source-stream
* gulp-uglify

```shell
$ npm install --save-dev babelify browserify vinyl-buffer vinyl-source-stream gulp-uglify
```

設定 `js` 任務：

```javascript
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

const paths = {
  css: 'dist/css/*.css',
  image: 'app/images/*.+(jpg|png|svg)',
  script: 'app/js/*.js',
  pugs: 'app/pug/**/*.pug',
  sass: 'app/sass/**/*.+(sass|scss)'
}

// javascript
gulp.task('js', () => {
  const bundler = browserify({
    entries: 'app/js/app.js',
    debug: true
  });

  bundler.transform(babelify);

  bundler.bundle()
    .on('error', function(err) { console.error(err) })
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'))
    .pipe(notify({message: `js task: ${filePath}`}))
})
```

設定 `watch` 任務，如果 `app/js/*.js` 檔案變更，要 reload browser：

```javascript
gulp.task('watch', ['browserSync', 'setWatch', 'pug', 'sass', 'img', 'js'], () => {
  gulp.watch(paths.css).on('change', browserSync.reload);
  gulp.watch(paths.image, ['img']);
  gulp.watch(paths.script, ['js']).on('change', browserSync.reload);
  gulp.watch(paths.pugs, ['pug']);
  gulp.watch(paths.sass, ['sass']);
});
```

設定 `build` `default` task：

```javascript
gulp.task('build', () => {
  runSequence('clean:dist', ['pug', 'sass', 'img', 'js']);
});

gulp.task('default', () => {
  runSequence(['pug', 'sass', 'img', 'js','browserSync', 'watch'])
});
```

更多詳情可以參考：
* [Using gulp with Babel](http://macr.ae/article/gulp-and-babel.html)
* [Setting up ES6+Babel+Gulp](http://ramkulkarni.com/blog/setting-up-es6-babel-gulp/)

下面兩篇講解了什麼是 vinyl-source-stream、vinyl-buffer，以及為什麼 js task 的流程是這樣設定，看完會更了解 Gulp 在病蝦咪盲：

* [来自Gulp的难题](https://segmentfault.com/a/1190000003770541)
* [Gulp 范儿——Gulp 高级技巧](https://csspod.com/advanced-tips-for-using-gulp-js/)

# 圖片處理

詳情可以參考：

* https://www.npmjs.com/package/gulp-imagemin
* [Gulp插件使用](http://www.jianshu.com/p/545f86439a93)

安裝 `gulp-imagemin` `imagemin-pngquant`：

```shell
$ npm install --save-dev gulp-imagemin imagemin-pngquant
```

設定 `img` task：

```javascript
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant';

const paths = {
  pugs: 'app/pug/**/*.pug',
  sass: 'app/sass/**/*.+(sass|scss)',
  css: 'dist/css/*.css',
  image: 'app/images/*.+(jpg|png|svg)'
}

gulp.task('img', () => {
  return gulp.src(paths.image)
    .pipe(cached(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe(notify({message: `img task: ${filePath}`}))
})
```

使用 `gulp-cached` 來處理只有變更過的檔案才需要壓縮。

現在遇到一個問題是，當刪掉來源圖片 `app/images/a.jpg`，輸出圖片並不會跟著被刪除 `dist/images/a.jpg` 還在，變成你要先離開 `gulp` task，然後執行 `gulp build`，`dist/` 才會被清空。

有找到這個解法：[Handling the Delete Event on Watch](https://github.com/gulpjs/gulp/blob/master/docs/recipes/handling-the-delete-event-on-watch.md)

但測試行不通，所以暫時擱置。

# 如何修改 .gitignore 名單

剛剛發現之前在 `.gitignore` 裡面，把 `bower_components` 的名稱拼錯，所以現在這個資料夾一直在被追蹤，那麼要如何取消追蹤呢？

把 `.gitignore` 的名單修正後，執行：

```shell
$ git rm --cached <filename> -r
```

因為 `bower_components` 是資料夾，裡面又還有子資料夾，所以要加上 `-r`，如果是針對單一檔案就只要：`git rm --cached <filename>` 就好。

所以按我的例子就是：

```shell
$ git rm --cached bower_components -r

rm 'bower_components/breakpoint-sass/.bower.json'
rm 'bower_components/breakpoint-sass/CHANGELOG.md'
rm 'bower_components/breakpoint-sass/CONTRIBUTING.md'
rm 'bower_components/breakpoint-sass/README.md'
rm 'bower_components/breakpoint-sass/bower.json'
rm 'bower_components/breakpoint-sass/eyeglass-exports.js'
rm 'bower_components/breakpoint-sass/package.json'
```

此時 `.gitignore` 已經加回正確的資料夾名稱，所以：

```shell
$ git add -A
$ git commit -m "Remove bower_components dir from track files"
```

詳情可以參考：

http://stackoverflow.com/questions/1274057/how-to-make-git-forget-about-a-file-that-was-tracked-but-is-now-in-gitignore

# 把 gulpfile 切成多個檔案

一路寫下來會發現 gulpfile 超級長，可以把各個任務切出來獨立一個檔案，然後匯入到 `gulpfile.babel.js`。

## gulp-load-plugins

首先，安裝一個套件 `gulp-load-plugins`：

```shell
$ npm install --save-dev gulp-load-plugins
```

`gulp-load-plugins` 會去撈出所有你裝的 Gulp 套件，可以這樣使用：

```javascript
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
```

`gulp-load-plugins` 會幫你做這樣的事情：

```javascript
plugins.jshint = require('gulp-jshint');
plugins.concat = require('gulp-concat');
```

所以就不用 require 一堆套件。

### 如果不是 Gulp 的套件？

`gulp-load-plugins` 預設會去撈 `gulp-*` 名稱的套件，但如果像是 `browser-sync` 怎麼處理？

`gulp-load-plugins` 有一些參數可以自訂，針對前面那個問題，就是把參數 `pattern` 設成 `*`：

```javascript
gulpLoadPlugins({
  pattern: '*'
})
```

這樣就會撈到所有名稱的套件。

### 變更名稱

`gulp-load-plugins` 預設會取 `gulp-` 後面的名稱作為變數使用，如果有一個套件是 `gulp-if`，那就會是 `plugins.if`。

也可以自訂名稱，使用 `rename` 參數：

```javascript
gulpLoadPlugins({
  rename: {
    'gulp-if': 'gulpIf'
  }
})
```

詳情可以參考：
* https://www.npmjs.com/package/gulp-load-plugins
* [Splitting a gulpfile into multiple files](http://macr.ae/article/splitting-gulpfile-multiple-files.html)
* [How to use gulp-load-plugins with Browser-Sync?](http://stackoverflow.com/questions/33388559/how-to-use-gulp-load-plugins-with-browser-sync)
* [Using ES6 with Gulp](https://medium.com/@yabasha/using-es6-with-gulp-18e8dec28f7a#.ryao21ocv)

## 切割 task 檔案

在根目錄建一個資料夾 `gulp-tasks`：

```shell
$ mkdir gulp-tasks
```

在我的例子中，我要把 `pug` `sass` `scripts` `img` 這四個 task 切出來，所以分別建立四個 js 檔案：

```
gulp-tasks/
  |-- img.js
  |-- pug.js
  |-- sass.js
  |-- scripts.js
```

然後在 `gulpfile.babel.js` 設定：

```javascript
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

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
```

接著在四個檔案分別設定各自任務：

```javascript
// pug.js

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
```

```javascript
// sass.js

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
```

```javascript
// scripts.js

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
```

```javascript
// img.js

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
```

其實可以發現只是要把原本寫在 gulpfile 的任務塞進：

```javascript
module.exports = function(gulp, plugins) {
  return () => {
    // task here
  }
}
```

並且要把套件變數前面都加上：`plugins.`

那要怎麼在 gulpfile 匯入這些任務，可以這樣：

```javascript
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

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

gulp.task('pug', require('./gulp-tasks/pug')(gulp, plugins));
gulp.task('sass', require('./gulp-tasks/sass')(gulp, plugins));
gulp.task('scripts', require('./gulp-tasks/scripts')(gulp, plugins));
gulp.task('img', require('./gulp-tasks/img')(gulp, plugins));
```

但還可以再精簡，設定一個 function `getTask()`：

```javascript
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';

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

function getTask(task) {
  return require(`./gulp-tasks/${task}`)(gulp, plugins);
}

gulp.task('pug', getTask('pug'));
gulp.task('sass', getTask('sass'));
gulp.task('scripts', getTask('scripts'));
gulp.task('img', getTask('img'));
```

完整設定如下：

```javascript
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
```

其實 Gulp 坑無限多，就是有時間還是可以再優化。

官方文件：

* [gulp documentation](https://github.com/gulpjs/gulp/blob/master/docs/README.md)
* [Recipes](https://github.com/gulpjs/gulp/tree/master/docs/recipes)
