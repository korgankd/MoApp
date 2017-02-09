angular.module('starter.services', [])

.directive('SelectDate', function($scope, $compiile){
    return {
        restrict : "A",
        template : "<td ng-click='clickDate($event)'>issa directive</td>",
        link: function(scope, element, attrs) {
            scope.onHandleClick = function() {
                console.log('onHandleClick');
            };
        }
    }

});