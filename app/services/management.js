'use strict';


angular
    .module('services', [])

    .factory('management', ['$q', '$http', function($q, $http){

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
        function processState(result) {
            if (result['response-headers']) {
                result.processState = result['response-headers']['process-state'];
                result['response-headers'] = null;
            }
            return result;
        }

        return {
            invoke: invoke
        }

    }]);
