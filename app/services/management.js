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
                deferred.reject(reason(data));
            });
            return deferred.promise;
        }

        function load(url, name) {
            var deferred = $q.defer();

            if (name == null) {
                deferred.resolve({});
            } else {
                $http({
                    method: 'GET', url: url + name
                }).
                success(function (data) {
                    data.name = name;
                    deferred.resolve(data);
                }).
                error(function (data) {
                    deferred.reject(reason(data));
                });
            }
            return deferred.promise;
        }

        function reason(data) {
            var reason = {};
            reason.error = data["failure-description"];
            if (data['response-headers']) {
                reason.processState = data['response-headers']['process-state'];
            }
            return reason;
        }

        return {
            list: list,
            load: load
        }

    }]);
