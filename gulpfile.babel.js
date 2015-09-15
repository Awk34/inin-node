'use strict';
import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';

gulp.task('babel', function() {
    return gulp.src('src/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/*.js', ['babel']);
});

gulp.task('test', ['babel'], function() {
    return gulp.src(['test/*.js'])
        .pipe(mocha({ reporter: 'spec' }))
        .on('error', err => console.log(err.stack));
});

// Default Task
gulp.task('default', ['babel', 'test']);
