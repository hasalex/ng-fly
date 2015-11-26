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
        // management.initPage([ { "subsystem": "cassandra" } ], "cluster")
        //     .then(loadKeyspaces);
        management.name = 'WildflyCluster';
        management.rootAddress = [ { "subsystem": "cassandra" } ];
        management.resourceType = "cluster";

        $scope.create = function(result) {
            return management.create(result.name, management.resource);
        };

        $scope.select = function() {
            $scope.keyspaces = null;
            $scope.keyspace = null;
            $location.search('name', management.name);
            load();
        };
        $scope.select();

        function load() {
            return management.load()
                .then(loadKeyspaces);
        }

        function loadKeyspaces() {
            if (management.name !== null) {
                $scope.loading = true;
                return management.list([ {"subsystem": "cassandra"}, {"cluster": management.name}], 'keyspace').then(
                    function(data) {
                        $scope.keyspaceNames = data.result;
                        $scope.loading = false;
                    },
                    function(reason) {
                        $scope.keyspaceNames = null;
                        $scope.loading = false;
                    }
                );
            }
        }

        $scope.selectKeyspace = function(name) {
            $scope.keyspaceName = name;
            $scope.loading = true;
            return management.invoke('read-resource', $scope.keyspaceAddress()).then(
                function(data) {
                    $scope.keyspace = data.result;
                    $scope.loading = false;
                },
                function() {
                    $scope.keyspace = null;
                    $scope.loading = false;
                }
            );
        };

        $scope.removeKeyspace = function(name) {
            // remove does not work
            $scope.loading = true;
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
                        $scope.loading = false;
                    });
        };

        $scope.addKeyspace = function() {
            $scope.keyspaceName = null;
            $scope.keyspace = {class: "org.apache.cassandra.locator.SimpleStrategy", replication_factor: 1};
        };


        $scope.createKeyspace = function() {
            $scope.loading = true;
            $scope.keyspaceName = $scope.keyspace.name;
            return management
                .create(management.name, $scope.keyspace, $scope.keyspaceAddress())
                .then(loadKeyspaces);
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
