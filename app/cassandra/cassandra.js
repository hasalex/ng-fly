'use strict';

angular
    .module('flyNg.cassandra', ['ngRoute', 'flyNg.services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/cassandra', {
                templateUrl: 'cassandra/cassandra.html',
                controller: 'CassandraController',
                reloadOnSearch: false
            });
    }])

    .controller('CassandraController', ['$scope', '$log', '$location', 'management', function ($scope, $log, $location, management) {

        $scope.management = management;
        management.initPage([ { "subsystem": "cassandra" } ], "cluster")
            .then(loadKeyspaces);

        $scope.create = function(result) {
//            management.resource['driver-name'] = result.name;
            return management.create(result.name, management.resource);
        };

        $scope.select = function() {
            $scope.keyspaces = null;
            $scope.keyspace = null;
            $location.search('name', management.name);
            load();
        };

        function load() {
            return management.load()
                .then(loadKeyspaces);
        }

        function loadKeyspaces() {
            if (management.name !== null) {
                return management.list([ {"subsystem": "cassandra"}, {"cluster": management.name}], 'keyspace').then(
                    function(data) {
                        $scope.keyspaceNames = data.result;
                    },
                    function(reason) {
                        $scope.keyspaceNames = null;
                    }
                );
            }
        }

        $scope.selectKeyspace = function(name) {
            $scope.keyspaceName = name;
            return management.invoke('read-resource', $scope.keyspaceAddress()).then(
                function(data) {
                    $scope.keyspace = data.result;
                },
                function() {
                    $scope.keyspace = null;
                }
            );
        };

        $scope.removeKeyspace = function(name) {
            // remove does not work
            return management
                .remove($scope.keyspaceAddress())
                .then(function() {
                    $scope.keyspaceName = null;
                    $scope.keyspace = null;
                })
                .then(
                    loadKeyspaces,
                    function(data) {
                        management.processError(data, data.status);
                    });
        };

        $scope.addKeyspace = function() {
            $scope.keyspaceName = null;
            $scope.keyspace = {class: "org.apache.cassandra.locator.SimpleStrategy", replication_factor: 1};
        }


        $scope.createKeyspace = function() {
            $scope.keyspaceName = $scope.keyspace.name;
            return management
                .create(management.name, $scope.keyspace, $scope.keyspaceAddress())
                .then(
                    loadKeyspaces,
                    function(data) {
                        management.processError(data, data.status);
                    });
        };

        $scope.keyspaceAddress = function() {
            var address = [{"subsystem": "cassandra"},
                {"cluster": management.name},
                {"keyspace": $scope.keyspaceName}];
            return address;
        };


        $scope.active = function(keyspaceName) {
            return (angular.equals($scope.keyspaceName, keyspaceName) ? 'active' : '');
        };
    }]);
