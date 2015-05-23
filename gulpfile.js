var gulp = require('gulp')

var util = require('gulp-util')
var sourcemaps = require('gulp-sourcemaps')
var buffer = require('vinyl-buffer')
var source = require('vinyl-source-stream')
var rename = require('gulp-rename')
var concat = require('gulp-concat')
var filter = require('gulp-filter')
var flatten = require('gulp-flatten')
var plumber = require('gulp-plumber')

var browserify = require('browserify')
var watchify = require('watchify')

var stylus = require('gulp-stylus')
var nib = require('nib')
var jeet = require('jeet')
var rupture = require('rupture')

var babelify = require('babelify')

var debowerify = require('debowerify')
var deamdify = require('deamdify')
var mainBowerFiles = require('main-bower-files')

var uglify = require('gulp-uglify')
var mincss = require('gulp-minify-css')

var livereload = require('gulp-livereload')

gulp.task('css:compile', function() {
  return gulp.src('src/styl/index.styl')
    .pipe(plumber({errorHandler: util.log}))
    .pipe(sourcemaps.init())
    .pipe(stylus({
      compress: true,
      use: [nib(), jeet(), rupture()]
    }))
    .pipe(sourcemaps.write())
    .pipe(rename('index.min.css'))
    .pipe(gulp.dest('lib/css'))
    .pipe(livereload())
})

var bundler =
  browserify('./src/js/index.js', {
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  })
  .transform(babelify.configure({
    ignore: /bower_components/,
    optional: ['runtime']
  }))
  .transform(debowerify)
  .transform(deamdify)

gulp.task('js:watch', function() {
  var watcher = watchify(bundler)
  var rebundle = function() {
    console.log('Bundling...')
    watcher.bundle()
      .on('error', util.log)
      .pipe(source('index.js'))
      .pipe(buffer())
      .pipe(gulp.dest('lib/js'))
      .pipe(livereload())
  }
  watcher.on('update', rebundle)
  rebundle()
})

gulp.task('js:compile', function() {
  return bundler
    .bundle()
    .pipe(source('index.js'))
    .pipe(gulp.dest('lib/js'))
})

gulp.task('js:minify', function() {
  return gulp.src('lib/js/index.js')
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(rename('index.min.js'))
    .pipe(gulp.dest('lib/js'))
})

gulp.task('bower', function() {
  var css = filter('*.css')
  var fonts = filter(['*.eot', '*.woff', '*.woff2', '*.svg', '*.ttf'])
  var images = filter(['*.jpg', '*.png', '*.gif'])
  return gulp.src(mainBowerFiles())
    .pipe(css)
    .pipe(flatten())
    .pipe(concat('bower_components.css'))
    .pipe(mincss())
    .pipe(gulp.dest('lib/css'))
    .pipe(css.restore())
    .pipe(fonts)
    .pipe(flatten())
    .pipe(gulp.dest('lib/fonts'))
    .pipe(fonts.restore())
    .pipe(images)
    .pipe(flatten())
    .pipe(gulp.dest('lib/css/images'))
})

gulp.task('reload', function() {
  livereload.listen()
  gulp.watch('src/styl/**/*.styl', ['css:compile'])
  gulp.watch(['**/*.html', '**/*.php', '**/*.twig']).on('change', livereload.reload)
})

gulp.task('assets', ['js:compile', 'js:minify', 'css:compile', 'bower'])
gulp.task('default', ['js:watch', 'reload'])
