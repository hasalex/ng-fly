'use strict';

angular
    .module('flyNg.ds', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/datasource', {
                templateUrl: 'datasource/datasource.html',
                controller: 'DataSourceController',
                reloadOnSearch: false
            });
    }])

    .controller('DataSourceController', ['$scope', 'management', function ($scope, management) {

        $scope.management = management;

        management.initPage([ { "subsystem": "datasources" } ], "data-source");

        $scope.create = function(result) {
             return management.create(result.name, management.resource);
        };

    }]);
