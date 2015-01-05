'use strict';

// Declare app level module which depends on views, and components
angular
    .module('flyNg',
        [
            'ngRoute',
            'ngCookies',
            'ui.bootstrap',
            'directives',
            'services',
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

    run( function ($rootScope) {
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                //save location.search so we can add it back after transition is done
                this.locationSearch = $location.search();
            }
        );

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                //restore all query string parameters back to $location.search
                $location.search(this.locationSearch);
            }
        );
    }).

    controller('MenuController', ['$scope', '$location', '$log', 'management', function ($scope, $location, $log, management) {
        $scope.management = management;

        var resources = [];
        management.invoke('read-children-names', [], {"child-type": "subsystem"}).then(
            function (data) {
                $log.debug(data);
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
