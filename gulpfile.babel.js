import gulp from 'gulp';
import del from 'del';
import autoprefixer from 'autoprefixer';
import browserSync from 'browser-sync';
import objectFit from 'postcss-object-fit-images';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import csso from 'gulp-csso';

import imagemin from 'gulp-imagemin';
import svgstore from 'gulp-svgstore';
import rename from 'gulp-rename';
import babel from 'rollup-plugin-babel';
import normalize from 'node-normalize-scss';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';

import prettier from 'gulp-pretty-html';
import pug from 'gulp-pug';

const rollup = require('rollup');

const server = browserSync.create();


gulp.task('clean', () => del('build'));

gulp.task('copy', () => gulp.src([
  'source/fonts/**/*.{woff,woff2}',
  'source/img/**/*',
  '!source/img/sprite',
  '!source/img/sprite/*',
], {
  base: 'source',
})
  .pipe(gulp.dest('build')));

gulp.task('html', () => gulp.src('source/*.pug')
  .pipe(plumber())
  .pipe(pug())
  .pipe(prettier({
    indent_size: 2,
    indent_char: ' ',
  }))
  .pipe(gulp.dest('build')));

gulp.task('style', () => gulp.src('source/sass/style.scss')
  .pipe(plumber())
  .pipe(sass({
    includePaths: normalize.includePaths,
  }))
  .pipe(postcss([
    autoprefixer(),
    objectFit(),
  ]))
  .pipe(csso())
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('build/css'))
  .pipe(server.stream()));

gulp.task('images', () => gulp.src('source/img/original/*.{png,jpg,svg}')
  .pipe(imagemin([
    imagemin.optipng({ optimizationLevel: 3 }),
    imagemin.jpegtran({ progressive: true }),
    imagemin.svgo({
      plugins: [
        { removeViewBox: false },
      ],
    }),
  ]))
  .pipe(gulp.dest('source/img')));

gulp.task('sprite', () => gulp.src('source/img/sprite/*.svg')
  .pipe(svgstore({
    inlineSvg: true,
  }))
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('source/img')));

gulp.task('js', () => rollup.rollup({
  input: './source/js/main.js',
  plugins: [
    resolve({
      mainFields: ['jsnext', 'main'],
      browser: true,
    }),
    commonjs(),
    babel(),
    uglify(),
  ],
}).then(bundle => bundle.write({
  file: './build/js/main.min.js',
  format: 'iife',
  name: 'main',
  sourcemap: true,
})));

gulp.task('server', () => {
  server.init({
    server: 'build/',
    notify: false,
    open: false,
    cors: true,
    ui: false,
  });

  gulp.watch('source/sass/**/*.{scss,sass}', gulp.series('style', 'refresh'));
  gulp.watch('source/img/sprite/*.svg', gulp.series('sprite', 'html', 'refresh'));
  gulp.watch(['source/*.pug', 'source/templates/**/*.pug'], gulp.series('html', 'refresh'));
  gulp.watch(['source/img/*', 'source/img/*/**', '!source/img/sprite/*.svg'], gulp.series('copy', 'refresh'));
  gulp.watch('source/js/*.js', gulp.series('js', 'refresh'));
});

gulp.task('refresh', (done) => {
  server.reload();
  done();
});

gulp.task('build', gulp.series(
  'clean',
  'copy',
  'images',
  'sprite',
  'style',
  'js',
  'html',
));

gulp.task('start', gulp.series(
  'clean',
  gulp.parallel(
    'copy',
    'style',
  ),
  'sprite',
  gulp.parallel(
    'html',
    'js',
  ),
  'server',
));
