'use strict';

angular
    .module('flyNg.ds', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/ds', {
                templateUrl: 'datasource/datasource.html',
                controller: 'DataSourceController'
            });
    }])
    .controller('DataSourceController', ['$scope', '$log', '$modal', 'management', function ($scope, $log, $modal, management) {

        $scope.name = null;
        $scope.resource = {};

        var rootAddress = [ { "subsystem": "datasources" } ];
        var resourceType = "data-source";

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
                        $log.debug(data);
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

            var data = {"name": attr, "value": $scope.resource[attr]};

            management.invoke("write-attribute", address(), data).then(
                function (data) {
                    $scope.processState = data.processState;
                },
                error
            )
        }

        $scope.reload = function() {
            management.invoke( "reload").then(
                function (data) {
                    $scope.processState = data.processState;
                },
                error
            );
        }

        $scope.create = function() {
            var data = {};
            data['enabled'] = $scope.resource['enabled'];
            data['jndi-name'] = $scope.resource['jndi-name'];
            data['driver-name'] = $scope.resource['driver-name'];
            data['connection-url'] = $scope.resource['connection-url'];
            data['user-name'] = $scope.resource['user-name'];
            data['password'] = $scope.resource['password'];

            management.invoke("add", address(), data).then(
                function (data) {
                    list();
                    $scope.load();
                    $scope.processState = data.processState;
                },
                error
            )
        }

        $scope.remove = function() {
            if ($scope.name == null) {
                $scope.resource = {};
                return;
            }

            management.invoke("remove", address()).then(
                function () {
                    $scope.name = null
                    list();
                    $scope.load();
                },
                function (reason) {
                    $scope.name = null;
                    error(reason);
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
                templateUrl: 'ds-name.html',
                controller: 'ModalInstanceCtrl'
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

    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);