'use strict';

angular
    .module('myApp.ds', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/ds', {
                templateUrl: 'ds/ds.html',
                controller: 'Ds2Ctrl'
            });
    }])

    .controller('Ds2Ctrl', function ($http, $scope, $modal) {

        $scope.ds = {};
        $scope.dsName = null;

        listDsNames();

        function listDsNames() {

            $http({
                method: 'GET',
                url: '/management/subsystem/datasources/'

            }).
            success(function (data, status, headers, config) {
                if (data['data-source']) {
                    $scope.dsNames = Object.keys(data['data-source']);
                }
            }).
            error(function (data, status, headers, config) {
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.loadDS = function() {

            if ($scope.dsName == null) {
                $scope.ds = {};
            } else {
                $http({
                    method: 'GET', url: '/management/subsystem/datasources/data-source/' + $scope.dsName
                }).
                success(function (data, status, headers, config) {
                    $scope.ds = data;
                    $scope.ds.name = $scope.dsName;
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
            if ($scope.dsName == null) {
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                 "operation": "write-attribute",
                 "operation-headers" : {"allow-resource-service-restart" : true }
            };
            data.address[1]['data-source'] = $scope.dsName;
            data.name = attr;
            data.value = $scope.ds[attr];

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
                console.log(data);
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
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                "operation": "add",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['data-source'] = $scope.dsName;
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
            success(function (data, status, headers, config) {
                listDsNames();
                $scope.loadDS();
            }).
            error(function (data, status, headers, config) {
                $scope.dsName = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.remove = function() {
            if ($scope.dsName == null) {
                $scope.ds = {};
                return;
            }

            var data = {
                "address": [{"subsystem": "datasources"}, {"data-source": null}],
                "operation": "remove",
                "operation-headers" : {"allow-resource-service-restart" : true }
            };

            data.address[1]['data-source'] = $scope.dsName;

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (data, status, headers, config) {
                $scope.dsName = null
                listDsNames();
                $scope.loadDS();
            }).
            error(function (data, status, headers, config) {
                $scope.dsName = null;
                $scope.error = data["failure-description"];
                if (data['response-headers']) {
                    $scope.processState = data['response-headers']['process-state'];
                }
            });
        }

        $scope.duplicate = function() {
            $scope.dsName = null;
        }

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.items = ['item1', 'item2', 'item3'];

        $scope.open = function () {

            var modalInstance = $modal.open({
                templateUrl: 'ds-name.html',
                controller: 'ModalInstanceCtrl'
            });

            modalInstance.result.then(
            function (name) {
                $scope.dsName = name;
                $scope.create();
            },
            function () {

            });
        };
    })
    .controller('ModalInstanceCtrl', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    });