'use strict';

angular
    .module('services', [])

    .factory('management', ['$q', '$http', '$log', function($q, $http, $log){

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
            if (result['response-headers']) {
                result.processState = result['response-headers']['process-state'];
                result['response-headers'] = null;
                $log.debug('process-state=' + result.processState);
            }
            return result;
        }

        function getterSetterWithExpression(attr) {

            return function(newValue) {
                if (angular.isDefined(newValue)) {
                    this[attr] = newValue;
                }
                if (this[attr].EXPRESSION_VALUE) {
                    return this[attr].EXPRESSION_VALUE;
                } else {
                    return this[attr];
                }
            }
        };


        return {
            invoke: invoke,
            getterSetterWithExpression: getterSetterWithExpression
        }

    }]);
