const del = require('del');
const babel = require('gulp-babel');
const gulp = require('gulp');
const babelrc = require('./babel.config.js');

const TS_SOURCE_DIR = ['./src/**/*.ts'];
const ESM_DIR = './es';
const LIB_DIR = './lib';

function buildLib() {
  return gulp.src(TS_SOURCE_DIR).pipe(babel(babelrc())).pipe(gulp.dest(LIB_DIR));
}

function buildEsm() {
  return gulp
    .src(TS_SOURCE_DIR)
    .pipe(
      babel(
        babelrc(null, {
          NODE_ENV: 'esm'
        })
      )
    )
    .pipe(gulp.dest(ESM_DIR));
}

function clean(done) {
  del.sync([LIB_DIR, ESM_DIR], { force: true });
  done();
}

exports.build = gulp.series(clean, gulp.parallel(buildLib, buildEsm));
