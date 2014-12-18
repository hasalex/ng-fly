'use strict';

angular
    .module('services', [])

    .factory('management', ['$q', '$http', function($q, $http){

        function list(url, attr) {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: url
            }).
            success(function (data) {
                if (data[attr]) {
                    deferred.resolve(Object.keys(data[attr]));
                } else {
                    deferred.resolve(null);
                }
            }).
            error(function (data) {
                var reason = {};
                reason.error = data["failure-description"];
                if (data['response-headers']) {
                    reason.processState = data['response-headers']['process-state'];
                }
                deferred.reject(reason);
            });
            return deferred.promise;
        }

        return {
            list: list
        }

    }]);
