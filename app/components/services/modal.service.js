'use strict';

angular
    .module('flyNg.services')
    .service('modalService', ['$uibModal', function($uibModal) {
        var modalDefaults = {
            templateUrl: '/partials/creation-name.html',
            controller : 'ModalInstanceCtrl'
        };
        this.show = function (options) {
            return $uibModal.open(modalDefaults).result;
        };
    }])
    .controller('ModalInstanceCtrl', ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
        $scope.modalOptions = {};
        $scope.modalOptions.ok = function () {
            $uibModalInstance.close($scope.data);
        };
        $scope.modalOptions.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }]);
