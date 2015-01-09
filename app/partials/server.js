'use strict';

angular
    .module('flyNg.server', ['services', 'ngCookies'])

    .controller('ServerController', ['$scope', '$rootScope', '$location', '$cookies', '$log', 'management', function ($scope, $rootScope, $location, $cookies, $log, management) {
        $scope.management = management;
        const KEY = 'server-url';
        var url = decodeURI($cookies[KEY]);
        if (url) {
            management.server = {"url": url};
        } else {
            management.server = {"url": "localhost"};
        }
        loadServerData();

        $scope.updateServerUrl = function() {
            $cookies[KEY] = encodeURI(management.server.url);
            loadServerData();
        };

        function loadServerData() {
            management.load([]).then(
                function(response) {
                    var serverState = response.result['server-state'];
                    if (serverState == 'reload-required') {
                        management.server.state = 'running';
                    } else {
                        management.server.state = serverState;
                    }
                },
                function(reason) {
                    //management.server.state = 'not connected';
                    $location.path('/');
                }
            );
        }

    }]);
