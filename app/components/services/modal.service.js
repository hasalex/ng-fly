'use strict';

angular
    .module('flyNg.services')

    .service('modalService', ['$modal', function($modal, $scope) {
        var modalDefaults = {
            templateUrl: '/partials/creation-name.html',
            controller : 'ModalInstanceCtrl'
        };

        this.show = function (scope, modalInstance) {
            return $modal.open(modalDefaults).result;
        };
    }])
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
        $scope.modalOptions = {};
        $scope.modalOptions.ok = function () {
            $modalInstance.close($scope.data);
        };
        $scope.modalOptions.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
