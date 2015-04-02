'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var del = require('del');
var browserSync = require('browser-sync');
var modrewrite = require('connect-modrewrite');
var karma = require('karma').server;

var $ = require('gulp-load-plugins')({lazy:true});

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
        directory: 'app/bower_components'
    };

    return gulp
        .src('./app/index.html')
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(['app/**/*.js', '!app/bower_components/**', 'app/*.css']), {relative: true}))
        .pipe(gulp.dest('app/'));
});

gulp.task('serve', function() {
    serve('app', 8888);
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

gulp.task('build', ['build-clean', 'build-template', 'dep'],  function() {
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

gulp.task('archive', ['build'],  function() {
    return gulp.src('dist/**')
        .pipe($.tar('fly-ng.tar'))
        .pipe($.gzip())
        .pipe(gulp.dest('dist'));
});

gulp.task('serve-dist', function() {
    serve('dist', 8880);
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  },
  done);
});

gulp.task('test-live', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false
  },
  done);
});

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);


// Reusable function(s)

function serve(dir, port) {
    var rewriteRules = [
        '%{REQUEST_METHOD} !OPTIONS',
        '^/management/(.*)$ http://localhost:9990/management/$1 [P]',
        '^/management$ http://localhost:9990/management [P]'
    ];
    var headers = function (req, res, next) {
        delete req.headers.origin;
        next();
    };

    browserSync({
        port: port,
        ui: {port: port+1},
        files: [dir + "/**/*.*"],
        server: dir,
        middleware: [headers, modrewrite(rewriteRules)]
    });
}
