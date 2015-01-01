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

    .controller('DriverController',
                ['$scope', '$log', '$routeParams', '$location', 'management',
                 function ($scope, $log, $routeParams, $location, management) {

        $scope.management = management;
        management.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        management.rootAddress = [ { "subsystem": "datasources" } ];
        management.resourceType = "jdbc-driver";

        management.list();
        management.load();

        $scope.create = function(result) {
            management.resource['driver-name'] = result.name;
            management.create(result.name, management.resource);
        };
    }]);
