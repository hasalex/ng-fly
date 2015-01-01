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
        management.initName();
        management.rootAddress = [ { "subsystem": "datasources" } ];
        management.resourceType = "data-source";

        management.list();
        management.load();

        $scope.create = function(result) {
             management.create(result.name, management.resource);
        };

    }]);
