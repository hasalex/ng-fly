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
        $scope.resource = {};

        var rootAddress = [ { "subsystem": "datasources" } ];
        var resourceType = "jdbc-driver";

        list();

        function list() {
            var attr = { "child-type": resourceType };
            management.invoke('read-children-names', rootAddress, attr).then(
                function(data) {
                    $scope.names = data.result;
                },
                error
            );
        }

        $scope.load = function() {
            if ($scope.name == null) {
                $scope.resource = {};
            } else {
                management.invoke('read-resource', address()).then(
                    function(data) {
                        $scope.resource = data.result;
                    },
                    error
                )
            }
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = {attr: $scope.resource[attr]};

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
            $scope.resource['driver-name'] = $scope.name;

            management.invoke('add', address(), $scope.resource).then(
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
                $scope.resource = {};
                return;
            }

            management.invoke('remove', address()).then(
                function () {
                    $scope.name = null;
                    list();
                    $scope.resource = {};
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
            var address = rootAddress.slice(0);
            var resource = {};
            resource[resourceType] = $scope.name;
            address.push( resource );
            return address;
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