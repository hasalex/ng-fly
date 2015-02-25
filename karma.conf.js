'use strict';

module.exports = function (config) {
    config.set({

        basePath: './',

        // which files are included in the browser and which files are watched and served by Karma.
        files: [
            'app/bower_components/angular*/angular.js',
            'app/bower_components/angular-route/angular-route.js',
            'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            'app/bower_components/angular-mocks/angular-mocks.js',
            'app/components/services/*.js',
            'test/**/*.spec.js',
            'app/app.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
