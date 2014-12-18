'use strict';

// Declare app level module which depends on views, and components
angular.module('flyNg',
  [
    'ngRoute',
    'ui.bootstrap',
    'services',
    'flyNg.ds',
    'flyNg.driver'
  ]
).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/ds'});
}]);
