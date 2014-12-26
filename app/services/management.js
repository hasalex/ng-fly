'use strict';

angular
    .module('services', [])

    .factory('management', ['$q', '$http', '$log', function($q, $http, $log){

        function invoke(operation, address, args) {
            var deferred = $q.defer();

            var data = angular.isDefined(args) ? args : {};
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
                var r = reason(data);
                $log.warn(r);
                deferred.reject(r);
            });
            return deferred.promise;
        }

        function reason(data) {
            var result = processState(data);
            result.message = data["failure-description"];
            return result;
        }

        function processState(result) {
            if ( angular.isDefined(result['response-headers']) ) {
                result.processState = result['response-headers']['process-state'];
                result['response-headers'] = null;
                $log.debug('process-state=' + result.processState);
            }
            return result;
        }

        return {
            invoke: invoke
        }

    }]);
