'use strict';

angular
    .module('services', [])

    .factory('management', ['$q', '$http', '$log', function($q, $http, $log){
        this.name = null;
        this.names = null;
        this.resource = null;
        this.error = null;
        this.processState = null;
        this.rootAddress = null;
        this.resourceType = null;

        function list() {
            var attr = { "child-type": this.resourceType };
            var that = this;
            invoke('read-children-names', this.rootAddress, attr).then(
                function(data) {
                    that.names = data.result;
                },
                error
            );
        }

        function load() {
            if (this.name == null) {
                this.resource = new Object();
            } else {
                var that = this;
                this.invoke('read-resource', this.address()).then(
                    function (data) {
                        that.resource = data.result;
                        that.resource.address = that.address();
                    },
                    error
                )
            }
        }

        function save(attr) {
            if (this.name == null) {
                return;
            }

            $log.debug('save attribute ' + attr + ':' + this.resource[attr]);
            var data = {"name": attr, "value": this.resource[attr]};
            var that = this;
            invoke("write-attribute", this.address(), data).then(
                function (data) {
                    that.processState = data.processState;
                },
                error
            )
        }

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

        function error(reason) {
            this.error = reason.message;
            if ( angular.isDefined(reason.processState) ) {
                this.processState = reason.processState;
            }
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
            }
            return result;
        }

        function address() {
            var address = this.rootAddress.slice(0);
            var resource = {};
            resource[this.resourceType] = this.name;
            address.push( resource );
            return address;
        }

        return {
            invoke: invoke,
            save: save,
            list: list,
            load: load,
            address: address
        }

    }]);

