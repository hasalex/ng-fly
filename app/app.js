'use strict';

// Declare app level module which depends on views, and components
angular
    .module('flyNg',
        [
            'ngRoute',
            'ngCookies',
            'ui.bootstrap',
            'flyNg.services',
            'flyNg.directives',
            'flyNg.ds',
            'flyNg.driver',
            'flyNg.network',
            'flyNg.security',
            'flyNg.server'
        ]
    ).

    config(['$routeProvider', function ($routeProvider) {
        $routeProvider.otherwise({
            templateUrl: 'partials/default.html'
        });
    //  $routeProvider.otherwise({redirectTo: '/ds'});
    }]).

    controller('MenuController', ['$scope', '$location', '$log', 'management', function ($scope, $location, $log, management) {
        $scope.management = management;

        management.resources = [];

        $scope.hasSubsystem = function (name) {
            return (management.resources.indexOf(name) >= 0);
        };

        $scope.active = function (path) {
            return (path === $location.path() ? 'active' : '');
        };
    }]);
