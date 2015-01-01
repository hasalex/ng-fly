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

    .controller('DataSourceController',
                ['$scope', '$log', '$routeParams', '$location', 'management', 'modalService',
                 function ($scope, $log, $routeParams, $location, management, modalService) {

        $scope.management = management;
        management.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        management.rootAddress = [ { "subsystem": "datasources" } ];
        management.resourceType = "data-source";

        $scope.resource = new Object();

        management.list();
        management.load();

        $scope.select = function() {
            $location.search('name', management.name);
            management.load();
        };

        $scope.reload = function() {
            management.invoke( "reload").then(
                function (data) {
                    management.processState = data.processState;
                },
                error
            );
        };

        $scope.remove = function() {
            if (management.name == null) {
                $scope.resource = {};
                return;
            }

            management.invoke("remove", address()).then(
                function () {
                    management.name = null;
                    list();
                    management.load();
                },
                function (reason) {
                    management.name = null;
                    error(reason);
                }
            )
        };

        $scope.duplicate = function() {
            $scope.management.name = null;
        };

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.open = function () {
            modalService.show().then(
                function(result) {
                    create(result.name);
                });
        };

        function create(name) {
            management.name = name;
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
                     management.load();
                     management.processState = data.processState;
                 },
                function (reason) {
                    management.name = null;
                    error(reason);
                }
            )
        }

        function error(reason) {
            $scope.error = reason.message;
            if ( angular.isDefined(reason.processState) ) {
                management.processState = reason.processState;
            }
        }

        function address() {
            var address = management.rootAddress.slice(0);
            var resource = {};
            resource[management.resourceType] = management.name;
            address.push( resource );
            return address;
        }

    }]);
