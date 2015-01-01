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

    .controller('DataSourceController',
                ['$scope', '$log', '$routeParams', '$location', 'management', 'modalService',
                 function ($scope, $log, $routeParams, $location, management, modalService) {

        $scope.management = management;
        management.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        management.rootAddress = [ { "subsystem": "datasources" } ];
        management.resourceType = "data-source";

        management.list();
        management.load();

        $scope.create = function(result) {
             management.create(result.name, management.resource);
        };

    }]);
