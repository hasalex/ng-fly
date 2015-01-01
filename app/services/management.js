'use strict';

angular
    .module('services', [])

    .factory('management', ['$q', '$http', '$log', '$location', '$routeParams', 'modalService', function($q, $http, $log, $location, $routeParams, modalService){
        this.name = null;
        this.names = null;
        this.resource = null;
        this.message = null;
        this.processState = null;
        this.rootAddress = null;
        this.resourceType = null;

        function list() {
            var attr = { "child-type": this.resourceType };
            var that = this;
            return invoke('read-children-names', this.rootAddress, attr).then(
                function(data) {
                    that.names = data.result;
                },
                function (reason) {
                    that.error(reason);
                }
            );
        }

        function load() {
            if (this.name == null) {
                this.resource = {};
                return $q.defer().promise;
            } else {
                var that = this;
                return this.invoke('read-resource', this.address()).then(
                    function (data) {
                        that.resource = data.result;
                        that.resource.address = that.address();
                    },
                    function (reason) {
                        that.error(reason);
                    }
                )
            }
        }

        function save(attr, data, address) {
            if (this.name == null) {
                return $q.defer().promise;
            }

            if (angular.isUndefined(data)) {
                data = this.resource;
            }
            if (angular.isUndefined(address)) {
                address = this.address();
            }

            $log.debug('Saving attribute ' + attr + ':' + data[attr]);
            var data = {"name": attr, "value": data[attr]};
            var that = this;
            return invoke("write-attribute", address, data).then(
                function (data) {
                    that.processState = data.processState;
                },
                function (reason) {
                    that.error(reason);
                }
            )
        }

        function duplicate() {
            this.name = null;
        }

        function select() {
            $location.search('name', this.name);
            this.load();
        }

        function reload() {
            var that = this;
            return this.invoke( "reload").then(
                function (data) {
                    that.processState = data.processState;
                },
                function (reason) {
                    that.error(reason);
                }
            );
        }

        function remove() {
            if (this.name == null) {
                this.resource = {};
                return $q.defer().promise;
            }

            var that = this;
            return this.invoke('remove', this.address()).then(
                function () {
                    that.name = null;
                    $location.search('name', null);
                    that.list();
                    that.load();
                },
                function (reason) {
                    that.name = null;
                    this.error(reason);
                }
            )
        }

        function create(name, data) {
            this.name = name;
            $location.search('name', this.name);

            var that = this;
            return this.invoke('add', this.address(), data).then(
                function (data) {
                    that.list();
                    that.load();
                    that.processState = data.processState;
                },
                function (reason) {
                    that.name = null;
                    that.error(reason);
                }
            )
        }

        function openModal(callback) {
            modalService.show().then(callback);
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
            this.message = reason.message;
            if ( angular.isDefined(reason.processState) ) {
                this.processState = reason.processState;
            }
        }

        function closeAlert() {
            this.message = null;
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

        function initName() {
            this.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        }

        return {
            invoke: invoke,
            save: save,
            list: list,
            load: load,
            reload: reload,
            duplicate: duplicate,
            select: select,
            remove: remove,
            create: create,
            closeAlert: closeAlert,
            address: address,
            error: error,
            openModal: openModal,
            initName: initName
        }

    }]);

