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

    .controller('DriverController', ['$scope', '$log', '$modal', 'management', function ($scope, $log, $modal, management) {

        $scope.name = null;
        $scope.driver = {};

        list();

        function list() {
            management.list('/management/subsystem/datasources/', 'jdbc-driver').then(
                function(data) {
                    $scope.names = data;
                },
                error
            );
        }

        $scope.load = function() {
            $log.debug('load for name : ' + $scope.name);
            management.load('/management/subsystem/datasources/jdbc-driver/', $scope.name).then(
                function(data) {
                    $scope.driver = data;
                },
                error
            );
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = {attr: $scope.driver[attr]};

            management.invoke('write-attribute', address(), data).then(
                function (data) {
                    $scope.processState = data;
                },
                error
            )
        }

        $scope.reload = function() {
            management.invoke( 'reload').then(
                function (data) {
                    $scope.processState = data;
                },
                error
            );
        }

        $scope.create = function() {
            $scope.driver['driver-name'] = $scope.name;

            management.invoke('add', address(), $scope.driver).then(
                function () {
                    list();
                    $scope.load();
                },
                function(reason) {
                    $log.warn(reason);
                    $scope.name = null;
                    error(reason);
                });
        }

        $scope.remove = function() {
            if ($scope.name== null) {
                $scope.driver = {};
                return;
            }

            management.invoke('remove', address()).then(
                function () {
                    $scope.name = null
                    list();
                    $scope.driver = {};
                },
                function () {
                    $scope.name = null;
                    error()
                }
            )
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
            });
        };

        function error(reason) {
            $scope.error = reason.error;
            if (reason.processState) {
                $scope.processState = reason.processState;
            }
        }

        function address() {
            return [{"subsystem": "datasources"}, {"jdbc-driver": $scope.name}];
        }

    }])
    .controller('DriverModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);