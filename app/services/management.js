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
        };

        function list(address, type) {

            if (angular.isUndefined(address)) {
                this.names = [];
                address = this.rootAddress;
            }
            if (angular.isUndefined(type)) {
                var newName = this.name;
                this.name = null;
                var that = this;
                return this.invoke('read-children-names', address, { "child-type": this.resourceType }).then(
                    function(data) {
                        that.names = data.result;
                    },
                    function (reason) {
                        that.error(reason);
                    }
                ).finally(
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
            } else {
                return this.invoke('read-resource', address);
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

            var that = this;
            if (data[attr]) {
                return this.invoke("write-attribute", address, {"name": attr, "value": data[attr]}).then(
                    function (data) {
                        that.processState = data.processState;
                    },
                    function (reason) {
                        that.error(reason);
                    }
                )
            } else {
                this.invoke("undefine-attribute", address, {"name": attr}).then(
                    function (data) {
                        that.processState = data.processState;
                    },
                    function (reason) {
                        that.error(reason);
                    }
                )
            }

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

        function remove(address) {
            if (this.name == null) {
                this.resource = {};
                return $q.defer().promise;
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
                    function (reason) {
                        that.name = null;
                        that.error(reason);
                    }

                )
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
                if (value == '') {
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
                }
                ,
                function (reason) {
                    that.name = null;
                    that.error(reason);
                }
            )
        }

        function openModal(callback) {
            return modalService.show().then(callback);
        }

        function invoke(operation, address, args) {
            var deferred = $q.defer();

            var data =  angular.isDefined(args) && args != null ? args : {};
            data.operation = operation;
            data.address = address;
            data['include-runtime'] = true;

            var url = (angular.isUndefined(this.server) ? '' : 'http://' + this.server.url) + '/management';
            $http({
                method: 'POST',
                url: url,
                withCredentials: true,
                data: data
            })
            .success(function (result) {
                deferred.resolve(processState(result));
            })
            .error(function (data) {
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
            if (data == null) {
                return '';
            } else {
                var result = processState(data);
                result.message = data["failure-description"];
                return result;
            }
        }

        function processState(result) {
            if ( result != null && angular.isDefined(result['response-headers']) ) {
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
            initName: initName,
            initPage: initPage
        }

    }]);

