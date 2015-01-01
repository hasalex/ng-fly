'use strict';

angular
    .module('flyNg.security', ['ngRoute', 'services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/security-domain', {
                templateUrl: 'security/security-domain.html',
                controller: 'SecurityDomainController',
                reloadOnSearch: false
            });
    }])

    .controller('SecurityDomainController', ['$scope', '$log', '$location', 'management', function ($scope, $log, $location, management) {

        $scope.management = management;
        management.initName();
        management.rootAddress = [ {"subsystem": "security"} ];
        management.resourceType = "security-domain";

        management.list();
        load();

        $scope.select = function() {
            $scope.loginModule = null;
            $location.search('name', management.name);
            load();
        };

        function load() {
            management.load().then(loadLoginModule);
        }

        function loadLoginModule() {
            management.invoke('read-resource', [ {"subsystem": "security"}, {"security-domain": management.name}, {"authentication": "classic"} ]).then(
                function(data) {
                    $scope.loginModules = data.result['login-modules'];
                    if ($scope.loginModules.length > 0) {
                        $scope.loginModule = $scope.loginModules[0];
                    }
                },
                function(reason) {
                    $scope.loginModules = null;
                }
            )
        }

        $scope.selectLoginModule = function(loginModule) {
            $scope.loginModule = loginModule;
        };

        $scope.active = function(loginModule) {
            return (angular.equals($scope.loginModule, loginModule) ? 'active' : '');
        };

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

        $scope.selectFlag = function(value) {
            $scope.loginModule.flag = value;
            $scope.saveLoginModuleAttr('flag');
        }

        $scope.saveLoginModuleAttr = function(attr) {
            management.save(attr, $scope.loginModule, $scope.loginModuleAddress());
        }

        $scope.loginModuleAddress = function() {
            var address = [{"subsystem": "security"},
                {"security-domain": management.name},
                {"authentication": "classic"},
                {"login-module": $scope.loginModule.code}]
            return address;
        }

    }]);