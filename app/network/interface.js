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
        management.initName();
        management.rootAddress = [  ];
        management.resourceType = "interface";

        management.list();
        management.load();

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

    }]);
