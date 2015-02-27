'use strict';

angular
    .module('flyNg.services')

    .factory('management', ['$q', '$http', '$log', '$location', '$routeParams', 'modalService', function($q, $http, $log, $location, $routeParams, modalService){
        /*jshint validthis:true */
        this.name = null;
        this.names = null;
        this.resource = null;
        this.current = {};
        this.rootAddress = null;
        this.resourceType = null;
        this.server = {stateClass: "has-success"};


        function initPage(address, type) {
            this.rootAddress = address;
            this.resourceType = type;

            var that = this;
            return this.list().then(
                function() {
                    that.initName();
                    that.load();
                }
            );
        }

        function list(address, type) {

            if (angular.isUndefined(address)) {
                this.names = [];
                address = this.rootAddress;
            }
            if (angular.isUndefined(type)) {
                var newName = this.name;
                this.name = null;
                var that = this;
                return this.invoke('read-children-names', address, { "child-type": this.resourceType })
                    .then(
                        function(data) {
                            that.names = data.result;
                        }
                    )
                    .finally(
                        function() {
                            // Counterpart of "var newName = this.name;"
                            // Turnaround for Chrome (no need for FF)
                            that.name = newName;
                        }
                    );
            } else {
                return this.invoke('read-children-names', address, { "child-type": type });
            }

        }

        function load(address) {
            if (angular.isUndefined(address)) {
                if (this.name === null) {
                    this.resource = {};
                    return emptyPromise();
                } else {
                    var that = this;
                    return this.invoke('read-resource', this.address()).then(
                        function (data) {
                            that.resource = data.result;
                            that.resource.address = that.address();
                        }
                    );
                }
            } else {
                return this.invoke('read-resource', address);
            }
        }

        function save(attr, data, address) {
            if (this.name === null) {
                return emptyPromise();
            }

            if (angular.isUndefined(data)) {
                data = this.resource;
            }
            if (angular.isUndefined(address)) {
                address = this.address();
            }

            if (data[attr]) {
                return this.invoke('write-attribute', address, {"name": attr, "value": data[attr]}).then(
                    function (data) {
                    }
                );
            } else {
                this.invoke('undefine-attribute', address, {"name": attr}).then(
                    function (data) {
                    }
                );
            }

        }

        function duplicate() {
            this.name = null;
        }

        function select() {
            $location.search('name', this.name);
            return this.load();
        }

        function reload() {
            return this.invoke( "reload").then(
                function (data) {
                }
            );
        }

        function remove(address) {
            if (this.name === null) {
                this.resource = {};
                return emptyPromise();
            }

            if (angular.isUndefined(address)) {
                var that = this;
                return this.invoke('remove', this.address()).then(
                    function () {
                        that.name = null;
                        $location.search('name', null);
                        return that.list();
                    }
                ).then(
                    function () {
                        return that.load();
                    },
                    function () {
                        that.name = null;
                    }

                );
            } else {
                return this.invoke('remove', address);
            }

        }


        function create(name, data, address) {
            this.name = name;
            $location.search('name', this.name);

            if (angular.isUndefined(address)) {
                address = this.address();
            }

            angular.forEach(data, function(value, key) {
                if (value === '') {
                    data[key] = null;
                }
            });

            var that = this;
            return this.invoke('add', address, data).then(
                function (response) {
                    that.processState = response.processState;
                    return that.list();
                }
            ).then(
                function () {
                    return that.load();
                },
                function () {
                    that.name = null;
                }
            );
        }

        function openModal(callback) {
            return modalService.show().then(callback);
        }

        function invoke(operation, address, args) {
            var deferred = $q.defer();

            var data =  angular.isDefined(args) && args !== null ? args : {};
            data.operation = operation;
            data.address = address;
            data['include-runtime'] = true;

            var url = (angular.isUndefined(this.server) ? '' : 'http://' + this.server.url) + '/management';
            var that = this;
            $http({
                method: 'POST',
                url: url,
                withCredentials: true,
                data: data
            })
            .success(function (data) {
                that.processSuccess(data);
                deferred.resolve(data);
            })
            .error(function (data, status) {
                deferred.reject(data, status);
            });

            return deferred.promise;
        }

        function closeAlert() {
            this.message = null;
        }

        function address() {
            var result = this.rootAddress.slice(0);
            var resource = {};
            resource[this.resourceType] = this.name;
            result.push( resource );
            return result;
        }

        function initName() {
            this.name = angular.isDefined($routeParams.name) ? $routeParams.name : null;
        }

        function processSuccess(response) {
            var headers = response['response-headers'];
            if (angular.isUndefined(headers)) {
                this.server.processState = '';
            } else {
                this.server.processState = headers['process-state'];
            }
            response['response-headers'] = null;
            this.server.stateClass = '';

            return response;
        }

        function processError(data, status) {
            this.current = {};
            this.current.message = '';
            if (status >= 300) {
                this.server.state = 'Unknown Error';
            } else if (status > 0) {
                this.server.state = 'Error ' + status;
            } else if (data !== null) {
                this.server.state = '';
                this.current.message = data['failure-description'] || '';
            }
            this.server.processState = '';
            this.server.stateClass = 'has-error';
        }

        function emptyPromise() {
            var deferred = $q.defer();
            deferred.resolve({});
            return deferred.promise;
        }

        return {
            processError: processError,
            processSuccess: processSuccess,
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
            openModal: openModal,
            initName: initName,
            initPage: initPage
        };

    }]);

