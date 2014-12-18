'use strict';

angular
    .module('flyNg.driver', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/driver', {
                templateUrl: 'driver/driver.html',
                controller: 'DriverController'
            });
    }])

    .controller('DriverController', function ($http, $scope, $modal) {

        $scope.driverName = null;
        $scope.driver = {};

        list();

        function list() {

            $http({
                method: 'GET',
                url: '/management/subsystem/datasources/'

            }).
            success(function (data, status, headers, config) {
                if (data['jdbc-driver']) {
                    $scope.driverNames = Object.keys(data['jdbc-driver']);
                }
            }).
            error(function (data, status, headers, config) {
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.load = function() {

            if ($scope.driverName == null) {
                $scope.driver = {};
            } else {
                $http({
                    method: 'GET', url: '/management/subsystem/datasources/jdbc-driver/' + $scope.driverName
                }).
                success(function (data, status, headers, config) {
                    $scope.driver = data;
                }).
                error(function (data, status, headers, config) {
                    $scope.error = data["failure-description"];
                    if (data['response-headers']) {
                        $scope.processState = data['response-headers']['process-state'];
                    }
                });
            }
        }

        $scope.save = function(attr) {
            if ($scope.driverName == null) {
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {"jdbc-driver": null}],
                 "operation": "write-attribute",
                 "operation-headers" : {"allow-resource-service-restart" : true }
            };
            data.address[1]['jdbc-driver'] = $scope.driverName;
            data.name = attr;
            data.value = $scope.driver[attr];

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data, status, headers, config) {
                $scope.processState = data['response-headers']['process-state'];
            }).
            error(function (data, status, headers, config) {
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });

        }

        $scope.reload = function() {
            var data = { "operation": "reload" };
            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data, status, headers, config) {
                $scope.processState = false;
            }).
            error(function (data, status, headers, config) {
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });

        }

        $scope.create = function() {
            var data = {
                "address": [{"subsystem": "datasources"}, {"jdbc-driver": null}],
                "operation": "add",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['jdbc-driver'] = $scope.driverName;
            data['driver-name'] = $scope.driverName;
            data['driver-module-name'] = $scope.driver['driver-module-name'];
            data['driver-xa-datasource-class-name'] = $scope.driver['driver-xa-datasource-class-name'];

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data, status, headers, config) {
                list();
                $scope.load();
            }).
            error(function (data, status, headers, config) {
                $scope.driverName = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.remove = function() {
            if ($scope.driverName== null) {
                $scope.driver = {};
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {}],
                "operation": "remove",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['jdbc-driver'] = $scope.driverName;

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data, status, headers, config) {
                $scope.driverName = null
                list();
                $scope.load();
            }).
            error(function (data, status, headers, config) {
                $scope.driverName = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.duplicate = function() {
            $scope.driverName = null;
        }

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.items = ['item1', 'item2', 'item3'];

        $scope.open = function () {

            var modalInstance = $modal.open({
                templateUrl: 'driver-name.html',
                controller: 'DriverModalInstanceCtrl'
            });

            modalInstance.result.then(
            function (name) {
                $scope.driverName = name;
                $scope.create();
            },
            function () {

            });
        };
    })
    .controller('DriverModalInstanceCtrl', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });