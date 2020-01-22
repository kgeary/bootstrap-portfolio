// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
var replace = require('gulp-replace');
var rename = require('gulp-rename');

// File paths
const files = { 
    scssPath: ['app/scss/**/*.scss'],
    jsPath: ['app/js/**/*.js', '!app/js/**/+(all|all.min).js'],
    htmlPath: ['app/**/*.html'],
}

// Sass task: compiles the style.scss file into style.css
function scssTask(){    
  return src(files.scssPath)
      .pipe(sourcemaps.init()) // initialize sourcemaps first
      .pipe(sass()) // compile SCSS to CSS
      .pipe(dest('app/css')) // Save the un-minified version
      .pipe(rename((path) => { path.basename += ".min"; }))
      .pipe(postcss([ autoprefixer(), cssnano() ])) // PostCSS plugins
      .pipe(sourcemaps.write('./maps')) // write sourcemaps file css
      .pipe(dest('app/css')
  ); // put final CSS in dist folder
}

// JS task: concatenates and uglifies JS files to script.js
function jsTask(){
  return src(files.jsPath)
      .pipe(concat('all.js'))
      .pipe(dest('app/js'))
      .pipe(rename((path) => { path.basename += ".min"; }))
      .pipe(uglify())
      .pipe(dest('app/js')
  );
}

// Cachebust
var cbString = new Date().getTime();
function cacheBustTask(){
  return src(files.htmlPath)
      .pipe(replace(/cb=\d+/g, 'cb=' + cbString))
      .pipe(dest('app'));
}

// Watch task: watch SCSS and JS files for changes
// If any change, run scss and js tasks simultaneously
function watchTask(){
  watch([...files.scssPath, ...files.jsPath], 
      series(
          parallel(scssTask, jsTask),
          cacheBustTask
      )
  );    
}

// Export the default Gulp task so it can be run
// Runs the scss and js tasks simultaneously
// then runs cacheBust, then watch task
exports.default = series(
  parallel(scssTask, jsTask), 
  cacheBustTask,
  watchTask
);