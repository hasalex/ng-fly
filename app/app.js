'use strict';

// Declare app level module which depends on views, and components
angular.module('flyNg',
  [
    'ngRoute',
    'ui.bootstrap',
    'services',
    'flyNg.ds',
    'flyNg.driver',
    'flyNg.network'
  ]
).
config(['$routeProvider', function($routeProvider) {
//  $routeProvider.otherwise({redirectTo: '/ds'});
}]).
controller('MenuController', ['$scope', '$location', 'management', function($scope, $location, management) {
  var resources = new Array();

  management.invoke('read-children-names', [], {"child-type": "subsystem"}).then(
      function(data) {
        resources = data.result;
      }
  );

  $scope.hasSubsystem = function (name) {
    return (resources.indexOf(name) >= 0);
  }
}]);
