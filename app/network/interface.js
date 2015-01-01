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

    .controller('InterfaceController', ['$scope', '$routeParams', 'management', function ($scope, $routeParams, management) {

        $scope.management = management;
        management.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        management.rootAddress = [  ];
        management.resourceType = "interface";

        management.list();
        management.load();

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

    }]);
