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
            $scope.loginModuleNames = null;
            $scope.loginModule = null;
            $scope.loginModuleName = null;
            $location.search('name', management.name);
            load();
        };

        $scope.remove = function() {
            management.remove().then(
                function() {
                    $scope.loginModuleNames = null;
                    $scope.loginModule = null;
                    $scope.loginModuleName = null;
                }
            );
        };


        function load() {
            management.load()
                .then(loadLoginModules)
                .then(selectFirstLoginModule);
        }

        function loadLoginModules() {
            return management.list([ {"subsystem": "security"}, {"security-domain": management.name}, {"authentication": "classic"} ], 'login-module').then(
                function(data) {
                    $scope.loginModuleNames = data.result;
                },
                function(reason) {
                    $scope.loginModuleNames = null;
                    var knownError = 'JBAS014807';
                    if (! reason.message.slice(0, knownError.length) == knownError ) {
                        management.error(reason);
                    }
                }
            );
        }

        function selectFirstLoginModule() {
            if ($scope.loginModuleNames != null && $scope.loginModuleNames.length > 0) {
                $scope.loginModuleName = $scope.loginModuleNames[0];
                $scope.selectLoginModule($scope.loginModuleName);
            } else {
                $scope.loginModuleName = null;
                $scope.loginModule = null;
            }
        }

        $scope.selectLoginModule = function(name) {
            $scope.loginModuleName = name;
            management.invoke('read-resource', $scope.loginModuleAddress()).then(
                function(data) {
                    $scope.loginModule = data.result;
                    showModuleOptions();
                },
                function() {
                    $scope.loginModule = null;
                }
            )
        };

        function showModuleOptions() {
            $scope.moduleOptions = [];
            angular.forEach($scope.loginModule['module-options'], function(value, key) {
                $scope.moduleOptions.push( { "key": key, "value": value } );
            });
            $scope.moduleOptions.push( { "key": "", "value": "" } );
        }

        $scope.removeLoginModule = function() {
            management.remove($scope.loginModuleAddress())
                .then(loadLoginModules)
                .then(selectFirstLoginModule);
        };

        $scope.addLoginModule = function() {
            $scope.loginModuleName = null;
            $scope.loginModule = {"flag": "required"};
            $scope.moduleOptions = [ { "key": "", "value": ""} ];
        };

        $scope.active = function(loginModule) {
            return (angular.equals($scope.loginModuleName, loginModule) ? 'active' : '');
        };

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

        $scope.selectFlag = function(value) {
            $scope.loginModule.flag = value;
            $scope.saveLoginModuleAttr('flag');
        };

        $scope.saveLoginModuleAttr = function(attr) {
            if ($scope.loginModuleName != null) {
                management.save(attr, $scope.loginModule, $scope.loginModuleAddress());
            }
        };

        $scope.createLoginModule = function() {
            management.load( [ {"subsystem": "security"}, {"security-domain": management.name}, {"authentication": "classic"} ]).then(
                function() {},
                function() {
                    $log.debug('ERROR');
                    management.create(management.name, null, [ {"subsystem": "security"}, {"security-domain": management.name}, {"authentication": "classic"} ]);
                }
            ).then(
                function() {
                    $scope.loginModuleName = $scope.loginModule.code;
                    management.create(management.name, $scope.loginModule, $scope.loginModuleAddress());
                }
            ).then(
                function() {
                    loadLoginModules();
                }
            );
        };

        $scope.loginModuleAddress = function() {
            var address = [{"subsystem": "security"},
                {"security-domain": management.name},
                {"authentication": "classic"},
                {"login-module": $scope.loginModuleName}];
            return address;
        };

        $scope.saveModuleOptions = function() {
            var modifiedModuleOptions = {};
            angular.forEach($scope.moduleOptions, function(obj) {
                if (obj.key !== '') {
                    modifiedModuleOptions[obj.key] = obj.value;
                }
            });
            $scope.loginModule['module-options'] = modifiedModuleOptions;

            if ($scope.loginModuleName != null) {
                management.save('module-options', $scope.loginModule, $scope.loginModuleAddress());
            }
            showModuleOptions();
        }

    }]);