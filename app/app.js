'use strict';

// Declare app level module which depends on views, and components
angular
    .module('flyNg',
        [
            'ngRoute',
            'ui.bootstrap',
            'directives',
            'services',
            'flyNg.ds',
            'flyNg.driver',
            'flyNg.network',
            'flyNg.security'
        ]
    ).

    config(['$routeProvider', function ($routeProvider) {
    //  $routeProvider.otherwise({redirectTo: '/ds'});
    }]).

    controller('MenuController', ['$scope', '$location', '$log', 'management', function ($scope, $location, $log, management) {
        var resources = new Array();

        management.invoke('read-children-names', [], {"child-type": "subsystem"}).then(
            function (data) {
                resources = data.result;
            }
        );

        $scope.hasSubsystem = function (name) {
            return (resources.indexOf(name) >= 0);
        };

        $scope.active = function (path) {
            return (path === $location.path() ? 'active' : '');
        };
    }]);
