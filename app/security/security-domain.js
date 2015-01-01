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

    .controller('SecurityDomainController',
                ['$scope', '$log', '$routeParams', '$location', 'management',
                    function ($scope, $log, $routeParams, $location, management) {

        $scope.management = management;
        management.initName();
        management.rootAddress = [ {"subsystem": "security"} ];
        management.resourceType = "security-domain";

        management.list();
        load();

        $scope.select = function() {
            $scope.loginModule = null;
            $location.search('name', this.name);
            load();
        };

        function load() {
            $scope.loginModules = [];
            if (management.name == null) {
                management.resource = {};
            } else {
                management.invoke('read-resource', management.address()).then(
                    function(data) {
                        management.resource = data.result;
                        loadLoginModule();
                    },
                    management.error
                )
            }
        }

        function loadLoginModule() {
            management.invoke('read-resource', [ {"subsystem": "security"}, {"security-domain": management.name}, {"authentication": "classic"} ]).then(
                function(data) {
                    $scope.loginModules = data.result['login-modules'];
                }
            )
        }

        $scope.selectLoginModule = function(loginModule) {
            $log.debug(loginModule);
            $scope.loginModule = loginModule;
        };

        $scope.active = function(loginModule) {
            return (angular.equals($scope.loginModule, loginModule) ? 'active' : '');
        };

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

    }]);