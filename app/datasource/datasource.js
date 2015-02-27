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

        function printStatistics(statistics) {
            if (!statistics) {
                statistics = {
                    ActiveCount: 0,
                    AvailableCount: 0,
                    InUseCount: 0,
                    MaxUsedCount: 0
                };
            }

            $scope.data = [
                {name: "Max", score: parseInt(statistics.InUseCount) + parseInt(statistics.AvailableCount)},
                {name: "Active", score: statistics.ActiveCount},
                {name: "InUse", score: statistics.InUseCount},
                {name: "MaxUses", score: statistics.MaxUsedCount}
            ];
        }

        $scope.select = function() {
            return management.select()
                .then(function() {
                    if (management.name === null) {
                        printStatistics();
                    } else {
                        var address = management.address();
                        address.push({"statistics": "pool"});
                        return management.load(address);
                    }
                }).then(function(data) {
                    printStatistics(data.result);
                });
        };

    }]);
