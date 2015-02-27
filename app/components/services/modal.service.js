'use strict';

angular
    .module('flyNg.services')

    .service('modalService', ['$modal', function($modal) {
        var modalDefaults = {
            templateUrl: '/app/partials/creation-name.html'
        };

        this.show = function () {
            modalDefaults.controller = function ($scope, $modalInstance) {
                $scope.modalOptions = {};
                $scope.modalOptions.ok = function () {
                    $modalInstance.close($scope.data);
                };
                $scope.modalOptions.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            return $modal.open(modalDefaults).result;
        };
    }]);
