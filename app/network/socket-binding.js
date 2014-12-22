'use strict';

angular
    .module('flyNg.network')

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/socket-binding', {
                templateUrl: 'network/socket-binding.html',
                controller: 'SocketBindingController'
            });
    }])

    .controller('SocketBindingController',
                ['$scope', '$log', '$modal', 'management', 'modalService',
                 function ($scope, $log, $modal, management, modalService) {

        $scope.name = null;
        $scope.resource = {};

        var rootAddress = [ {"socket-binding-group": "standard-sockets"} ];
        var resourceType = "socket-binding";

        list();

        function list() {
            var attr = { "child-type": resourceType };
            management.invoke('read-children-names', rootAddress, attr).then(
                function(data) {
                    $scope.names = data.result;
                },
                error
            );
        }

        $scope.load = function() {
            if ($scope.name == null) {
                $scope.resource = {};
            } else {
                management.invoke('read-resource', address()).then(
                    function(data) {
                        $scope.resource = data.result;
                        $scope.resource.xport = management.getterSetterWithExpression('port');
                    },
                    error
                )
            }
        }

        $scope.save = function(attr) {
            if ($scope.name == null) {
                return;
            }

            var data = { "name": attr, "value": $scope.resource[attr] };

            management.invoke('write-attribute', address(), data).then(
                function (data) {
                    $scope.processState = data.processState;
                },
                error
            )
        }

        $scope.reload = function() {
            management.invoke( 'reload').then(
                function (data) {
                    $scope.processState = data;
                },
                error
            );
        }

        $scope.remove = function() {
            if ($scope.name== null) {
                $scope.resource = {};
                return;
            }

            management.invoke('remove', address()).then(
                function () {
                    $scope.name = null;
                    list();
                    $scope.resource = {};
                },
                function () {
                    $scope.name = null;
                    error()
                }
            )
        }

        $scope.duplicate = function() {
            $scope.name = null;
        }

        $scope.closeAlert = function() {
            $scope.error = null;
        };

        $scope.open = function () {
            modalService.show().then(
                function(result) {
                    create(result.name);
                });
        };

        function create(name) {
            $scope.name = name;
            $scope.resource['driver-name'] = name;

            management.invoke('add', address(), $scope.resource).then(
                function () {
                    list();
                    $scope.load();
                },
                function(reason) {
                    $scope.name = null;
                    error(reason);
                });
        }

        function error(reason) {
            $scope.error = reason.error;
            if (reason.processState) {
                $scope.processState = reason.processState;
            }
        }

        function address() {
            var address = rootAddress.slice(0);
            var resource = {};
            resource[resourceType] = $scope.name;
            address.push( resource );
            return address;
        }

    }])
    .controller('DriverModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.ok = function () {
            $modalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);