'use strict';

angular
    .module('flyNg.driver', ['ngRoute', 'services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/driver', {
                templateUrl: 'datasource/driver.html',
                controller: 'DriverController',
                reloadOnSearch: false
            });
    }])

    .controller('DriverController', ['$scope', 'management', function ($scope, management) {

        $scope.management = management;
        management.initPage([ { "subsystem": "datasources" } ], "jdbc-driver");

        $scope.create = function(result) {
            management.resource['driver-name'] = result.name;
            return management.create(result.name, management.resource);
        };
    }]);
