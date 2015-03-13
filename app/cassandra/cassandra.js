'use strict';

angular
    .module('flyNg.cassandra', ['ngRoute', 'flyNg.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/cassandra', {
                templateUrl: 'cassandra/cassandra.html',
                controller: 'CassandraController',
                reloadOnSearch: false
            });
    }])

    .controller('CassandraController', ['$scope', '$log', '$location', 'management', function ($scope, $log, $location, management) {

        $scope.management = management;
        management.initPage([ { "subsystem": "cassandra" } ], "cluster");

        $scope.create = function(result) {
//            management.resource['driver-name'] = result.name;
            return management.create(result.name, management.resource);
        };

    }]);
