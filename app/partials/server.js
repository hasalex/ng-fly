'use strict';

angular
    .module('flyNg.server', ['services'])

    .controller('ServerController', ['$scope', 'management', function ($scope, management) {
        $scope.management = management;
        management.server = {"url": "localhost"};
    }]);
