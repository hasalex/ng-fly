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

        function invoke(operation, address, args) {
            var deferred = $q.defer();

            var data = args ? args : {};
            data.operation = operation;
            data.address = address;

            $http({
                method: 'POST',
                url: '/management',
                data: data
            }).
            success(function (result) {
                deferred.resolve(processState(result));
            }).
            error(function (data) {
                deferred.reject(reason(data));
            });
            return deferred.promise;
        }


        function reason(data) {
            var result = processState(data);
            result.error = data["failure-description"];
            return result;
        }
        function processState(data) {
            var result = {};
            if (data['response-headers']) {
                result.processState = data['response-headers']['process-state'];
            }
            return result;
        }

        return {
            list: list,
            load: load,
            invoke: invoke
        }

    }]);
