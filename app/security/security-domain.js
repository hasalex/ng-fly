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
                ['$scope', '$log', '$routeParams', '$location', 'management', 'modalService',
                    function ($scope, $log, $routeParams, $location, management, modalService) {

        $scope.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        $scope.resource = {};

        var rootAddress = [ {"subsystem": "security"} ];
        var resourceType = "security-domain";

        list();
        load();

        function list() {
            var attr = { "child-type": resourceType };
            management.invoke('read-children-names', rootAddress, attr).then(
                function(data) {
                    $scope.names = data.result;
                },
                error
            );
        }

        $scope.select = function() {
            $location.search('name', $scope.name);
            $scope.loginModule = null;
            load();
        };

        function load() {
            $scope.loginModules = [];
            if ($scope.name == null) {
                $scope.resource = {};
            } else {
                management.invoke('read-resource', address()).then(
                    function(data) {
                        $scope.resource = data.result;
                        loadLoginModule();
                    },
                    error
                )
            }
        };

        function loadLoginModule() {
            management.invoke('read-resource', [ {"subsystem": "security"}, {"security-domain": $scope.name}, {"authentication": "classic"} ]).then(
                function(data) {
                    $scope.loginModules = data.result['login-modules'];
                }
            )
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = { "name": attr, "value": $scope.resource[attr] };

            management.invoke('write-attribute', address(), data).then(
                function (data) {
                    $scope.processState = data.processState;
                },
                error
            )
        };

        $scope.reload = function() {
            management.invoke( 'reload').then(
                function (data) {
                    $scope.processState = data;
                },
                error
            );
        };

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
        };

        $scope.duplicate = function() {
            $scope.name = null;
        };

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.open = function () {
            modalService.show().then(
                function (result) {
                    create(result.name);
                });
        };

        $scope.selectLoginModule = function(loginModule) {
            $log.debug(loginModule);
            $scope.loginModule = loginModule;
            $scope.loginModule['module-options'].x_usersProperties = management.getterSetterWithExpression('usersProperties');
            $scope.loginModule['module-options'].x_rolesProperties = management.getterSetterWithExpression('rolesProperties');
        };

        $scope.active = function(loginModule) {
            return (angular.equals($scope.loginModule, loginModule) ? 'active' : '');
        };

        function create(name) {
            $scope.name = name;
            $scope.resource['driver-name'] = name;

            management.invoke('add', address(), $scope.resource).then(
                function () {
                    list();
                    $scope.load();
                },
                function(reason) {
                    $scope.name = null;
                    error(reason);
                });
        }

        function error(reason) {
            $scope.error = reason.error;
            if ( angular.isDefined(reason.processState) ) {
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

    }]);