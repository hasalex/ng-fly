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

    .controller('DataSourceController', ['$http', '$scope', '$log', '$modal', 'management', function ($http, $scope, $log, $modal, management) {

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

            var data = {
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                 "operation": "write-attribute",
                 "operation-headers" : {"allow-resource-service-restart" : true }
            };
            data.address[1]['data-source'] = $scope.name;
            data.name = attr;
            data.value = $scope.ds[attr];

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
            success(function (data) {
                console.log(data);
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
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                "operation": "add",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['data-source'] = $scope.name;
            data['enabled'] = $scope.ds['enabled'];
            data['jndi-name'] = $scope.ds['jndi-name'];
            data['driver-name'] = $scope.ds['driver-name'];
            data['connection-url'] = $scope.ds['connection-url'];
            data['user-name'] = $scope.ds['user-name'];
            data['password'] = $scope.ds['password'];

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
            if ($scope.name == null) {
                $scope.ds = {};
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                "operation": "remove",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['data-source'] = $scope.name;

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
                templateUrl: 'ds-name.html',
                controller: 'ModalInstanceCtrl'
            });

            modalInstance.result.then(
            function (name) {
                $scope.name = name;
                $scope.create();
            },
            function () {

            });
        };

        function error($scope, reason) {
            $scope.error = reason.error;
            if (reason.processState) {
                $scope.processState = reason.processState;
            }
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