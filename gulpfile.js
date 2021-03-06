var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var minify = require('gulp-minify');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var es = require('event-stream');
var data = require('gulp-data');
var fs = require("fs");
var path = require('path');

gulp.task('default', ['views', 'sass', 'compress', 'webserver'], function() {
  gulp.watch('src/SCSS/*.scss', ['sass']);
  gulp.watch('src/views/*.pug', ['views']);
  gulp.watch('src/views/**/*.pug', ['views']);
  gulp.watch('src/views/components/*.pug', ['views']);
  gulp.watch('src/views/sections/*.pug', ['views']);
  gulp.watch('src/JS/*.js', ['compress']);
  gulp.watch('src/JS/*.json', ['compress']);
  gulp.watch('src/JS/components/*.js', ['compress']);
});

gulp.task('views', function buildHTML() {
  var normal = gulp.src(['src/views/*.pug'])
    .pipe(pug())
    .pipe(gulp.dest('.'));

  var china = gulp.src(['src/views/china/**/*.pug'])
    .pipe(pug())
    .pipe(gulp.dest('./china'));

  function getDirectories(){
    source = "src/views/russia/";
    return fs.readdirSync(source).map(function(name){
      return path.join(source, name);
    }).filter(function(source){
      return fs.lstatSync(source).isDirectory();
    }).map(function(name){
      return name.replace(source, "");
    });
  }

  var russia = gulp.src(['src/views/russia/**/*.pug'])
    .pipe(data(function (file){
      return {
        "read": fs.readFileSync,
        "getDirectories": getDirectories
      };
    }))
    .pipe(pug())
    .pipe(gulp.dest('./russia/'));

  return es.concat(normal, china, russia);
});

gulp.task('sass', function () {
  return gulp.src('src/SCSS/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('dist/CSS'));
});

gulp.task('compress', function() {
  gulp.src(["src/JS/script.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/china.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/data.json"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/piechart.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/ml-troll-detector.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/troll-landing.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
  gulp.src(["src/JS/line-chart.js"])
    .pipe(minify({}))
    .pipe(gulp.dest('dist'));
});

gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      open: false
    }));
});
