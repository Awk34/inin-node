'use strict';
import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import runSequence from 'run-sequence';
import copy from 'gulp-copy';

gulp.task('build', cb => {
    runSequence(['babel', 'copy:dist'], cb);
});

gulp.task('copy:dist', function() {
    gulp.src(['src/**/*', '!src/**/*.js'])
        .pipe(gulp.dest('dist'));
});

gulp.task('babel', function() {
    return gulp.src('src/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/*.js', ['babel']);
});

gulp.task('test', ['build'], function() {
    return gulp.src(['test/*.js'])
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', err => console.log(err.stack));
});

// Default Task
gulp.task('default', ['build', 'test']);
