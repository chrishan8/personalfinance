app.controller('UICtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', 'Data', function($scope, $timeout, $mdSidenav, $log, $http, Data) {
    console.log(Data);
    // Left Sidenav Configuration
    $scope.toggleLeft = buildDelayedToggler('left');

	function debounce(func, wait, context) {
        var timer;
        return function debounced() {
            var context = $scope, args = Array.prototype.slice.call(arguments);
            $timeout.cancel(timer);
            timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
            }, wait || 10);
        };
    }

    function buildDelayedToggler(navID) {
        return debounce(function() {
            $mdSidenav(navID).toggle()
            .then(function () {
                $log.debug("toggle " + navID + " is done");
            });
        }, 200);
    }

    $scope.close = function () {
      	$mdSidenav('left').close()
        	.then(function () {
          		$log.debug("close LEFT is done");
        	});
    };

    // Retrieve User's Financial Data
    $scope.Accounts = Data.getAccounts();
    console.log($scope.Accounts);
}])


