'use strict';

angular
    .module('flyNg.network')

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/socket-binding', {
                templateUrl: 'network/socket-binding.html',
                controller: 'SocketBindingController',
                reloadOnSearch: false
            });
    }])

    .controller('SocketBindingController', ['$scope', 'management', function ($scope, management) {

        $scope.management = management;
        management.initName();
        management.rootAddress = [ {"socket-binding-group": "standard-sockets"} ];
        management.resourceType = "socket-binding";

        management.list();
        management.load();

        $scope.create = function(result) {
            management.create(result.name, management.resource);
        };

    }]);
