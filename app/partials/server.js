'use strict';

angular
    .module('flyNg.server', ['flyNg.services', 'ngCookies'])

    .controller('ServerController', ['$scope', '$rootScope', '$location', '$cookies', '$log', 'management', function ($scope, $rootScope, $location, $cookies, $log, management) {
        $scope.management = management;
        var KEY = 'server-url';
        if (!angular.isUndefined($cookies[KEY])) {
            var url = decodeURI($cookies[KEY]);
        }
        if (angular.isUndefined(url)) {
            management.server = {"url": "localhost"};
        } else {
            management.server = {"url": url};
        }
        loadServerData();

        $scope.updateServerUrl = function() {
            $cookies[KEY] = encodeURI(management.server.url);
            loadServerData();
        };

        function loadServerData() {
            management.server.stateDetail = null;
            management
                .load([])
                .then(
                    function(response) {
                        var serverState = response.result['server-state'];
                        if (serverState === 'reload-required') {
                            management.server.state = 'running';
                        } else {
                            management.server.state = serverState;
                        }
                        return management.list([], "subsystem");
                    })
                .then(
                    function (data) {
                        management.resources = data.result;
                    }, function(data) {
                        if (data) {
                            management.server.state = 'Error ' + data.status;
                            management.server.stateDetail = data['failure-description'];
                        } else {
                            management.server.state = 'not connected';
                        }
                        $location.path('/');
                        $location.search('name', null);
                    }
                );
        }

    }]);
