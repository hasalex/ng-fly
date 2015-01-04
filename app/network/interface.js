'use strict';

angular
    .module('flyNg.network', ['ngRoute', 'services'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/interface', {
                templateUrl: 'network/interface.html',
                controller: 'InterfaceController',
                reloadOnSearch: false
            });
    }])

    .controller('InterfaceController', ['$scope', 'management', function ($scope, management) {

        $scope.management = management;
        management.initPage([ ], "interface");

        $scope.create = function(result) {
            return management.create(result.name, management.resource);
        };

    }]);
