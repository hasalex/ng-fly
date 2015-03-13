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
        management.initPage([ {"socket-binding-group": "standard-sockets"} ], "socket-binding");

        $scope.create = function(result) {
            return management.create(result.name, management.resource);
        };

    }]);
