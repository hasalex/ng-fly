'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')({lazy:true});

gulp.task('default', function() {
    // place code for your default task here
});

gulp.task('lint', function() {
    return gulp
        .src(['./app/**/*.js', '!./app/bower_components/**'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', { verbose: true }))
        .pipe($.jshint.reporter('fail'));
});


gulp.task('dep', function() {
    var wiredep = require('wiredep').stream;
    var options = {
        bowerJson: require('./bower.json'),
        directory: 'app/bower_components',
        exclude: [ /jquery/ ]
    };

    return gulp
        .src('./app/index.html')
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(['app/**/*.js', '!app/bower_components/**', 'app/*.css']), {relative: true}))
        .pipe(gulp.dest('app/'));
});

gulp.task('serve', function() {

    var connectOptions = {
        root: 'app',
        port: 8888
    };
    $.connect.server(connectOptions);

});

gulp.task('sync', function() {
    var browserSyncOptions = {
        proxy: "localhost:8888",
        port: 3000,
        files: ['./app/**/*.*']
    };

    browserSync(browserSyncOptions);
});

gulp.task('build-template', function() {
    return gulp
        .src('./app/**/*.html')
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            'template.js',
            {
                module: "flyNg",
                standAlone: false
            }
        ))
        .pipe(gulp.dest('app/.tmp/'));
});

gulp.task('build-clean',  function(done) {
    del(['dist/**', 'app/.tmp/**'], done);
});

gulp.task('build-index', ['build-clean', 'build-template', 'dep'],  function() {
    var userefAssets = $.useref.assets();
    var cssFilter = $.filter('**/*.css');
    var jsFilter = $.filter('**/*.js');

    return gulp
        .src('./app/index.html')
        .pipe($.plumber())
        .pipe($.inject(gulp.src('app/.tmp/template.js', {read: false}), {
            relative: true,
            starttag: '<!-- inject:templates:js -->'
        }))

        .pipe(userefAssets)
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe($.rev())
        .pipe(userefAssets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(gulp.dest('./dist/'))

        .pipe($.rev.manifest())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('serve-dist', function() {

    var connectOptions = {
        root: 'dist',
        port: 8888,
        livereload: true
    };
    $.connect.server(connectOptions);

});

gulp.task('test', function () {
    return gulp.src('./test/*.spec.js')
        .pipe($.jasmine());
});

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);
