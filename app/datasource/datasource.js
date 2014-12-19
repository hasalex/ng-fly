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

        $scope.ds = {};
        $scope.name = null;

        list();

        function list() {
            management.list('/management/subsystem/datasources/', 'data-source').then(
                function(data) {
                    $scope.names = data;
                },
                error
            );
        }

        $scope.load = function() {
            $log.debug("load for name : " + $scope.name);
            management.load('/management/subsystem/datasources/data-source/', $scope.name).then(
                function(data) {
                    $scope.ds = data;
                },
                error
            );
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = {"name": attr, "value": $scope.ds[attr]};

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
            data['enabled'] = $scope.ds['enabled'];
            data['jndi-name'] = $scope.ds['jndi-name'];
            data['driver-name'] = $scope.ds['driver-name'];
            data['connection-url'] = $scope.ds['connection-url'];
            data['user-name'] = $scope.ds['user-name'];
            data['password'] = $scope.ds['password'];

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
                $scope.ds = {};
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
            return [{"subsystem": "datasources"}, {"data-source": $scope.name}];
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