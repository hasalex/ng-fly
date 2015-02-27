'use strict';

angular
    .module('flyNg.directives')

    .directive('wfExpression', [function() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$formatters.push(function(inputValue) {
                    if (angular.isDefined(modelCtrl.$modelValue) && angular.isDefined(modelCtrl.$modelValue.EXPRESSION_VALUE)) {
                        return modelCtrl.$modelValue.EXPRESSION_VALUE;
                    } else {
                        return inputValue;
                    }
                });
            }
        };
    }])
;