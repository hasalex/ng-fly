'use strict';

angular
    .module('flyNg.driver', ['ngRoute', 'services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/driver', {
                templateUrl: 'driver/driver.html',
                controller: 'DriverController'
            });
    }])

    .controller('DriverController', ['$http', '$scope', '$modal', 'management', function ($http, $scope, $modal, management) {

        $scope.name = null;
        $scope.driver = {};

        list();

        function list() {
            management.list('/management/subsystem/datasources/', 'jdbc-driver').then(
                function(data) {
                    $scope.names = data;
                },
                function(reason) {
                    $scope.error = reason.error;
                    if (reason.processState) {
                        $scope.processState = reason.processState;
                    }
                }
            );
        }

        $scope.load = function() {

            if ($scope.name == null) {
                $scope.driver = {};
            } else {
                $http({
                    method: 'GET', url: '/management/subsystem/datasources/jdbc-driver/' + $scope.name
                }).
                success(function (data) {
                    $scope.driver = data;
                }).
                error(function (data) {
                    $scope.error = data["failure-description"];
                    if (data['response-headers']) {
                        $scope.processState = data['response-headers']['process-state'];
                    }
                });
            }
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {"jdbc-driver": null}],
                 "operation": "write-attribute",
                 "operation-headers" : {"allow-resource-service-restart" : true }
            };
            data.address[1]['jdbc-driver'] = $scope.name;
            data.name = attr;
            data.value = $scope.driver[attr];

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data) {
                $scope.processState = data['response-headers']['process-state'];
            }).
            error(function (data) {
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
            success(function () {
                $scope.processState = false;
            }).
            error(function (data) {
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

            data.address[1]['jdbc-driver'] = $scope.name;
            data['driver-name'] = $scope.name;
            data['driver-module-name'] = $scope.driver['driver-module-name'];
            data['driver-xa-datasource-class-name'] = $scope.driver['driver-xa-datasource-class-name'];

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function () {
                list();
                $scope.load();
            }).
            error(function (data) {
                $scope.name = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.remove = function() {
            if ($scope.name== null) {
                $scope.driver = {};
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {}],
                "operation": "remove",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['jdbc-driver'] = $scope.name;

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function () {
                $scope.name = null
                list();
                $scope.load();
            }).
            error(function (data) {
                $scope.name = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.duplicate = function() {
            $scope.name = null;
        }

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.open = function () {

            var modalInstance = $modal.open({
                templateUrl: 'driver-name.html',
                controller: 'DriverModalInstanceCtrl'
            });

            modalInstance.result.then(
            function (name) {
                $scope.name = name;
                $scope.create();
            },
            function () {

            });
        };
    }])
    .controller('DriverModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);