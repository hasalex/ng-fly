'use strict';

angular
    .module('flyNg.server', ['services', 'ngCookies'])

    .controller('ServerController', ['$scope', '$location', '$cookies', '$log', 'management', function ($scope, $location, $cookies, $log, management) {
        $scope.management = management;
        var key = 'server-url';
        var url = decodeURI($cookies[key]);
        if (url) {
            management.server = {"url": url};
        } else {
            management.server = {"url": "localhost"};
        }
        loadServerData();

        $scope.updateServerUrl = function() {
            $cookies[key] = encodeURI(management.server.url);
            loadServerData();
        };

        function loadServerData() {
            management.load([]).then(
                function(response) {
                    management.server.state = response.result['server-state'];
                    $log.debug('OK');
                },
                function() {
                    management.server.state = 'not connected';
                    $location.path('/');
                }
            );
        }
    }]);
