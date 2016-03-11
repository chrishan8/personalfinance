app.controller('UICtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', function($scope, $timeout, $mdSidenav, $log, $http) {
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

    // Populate Sidenav with Data
    $scope.userfinancialdata = [];
    $http({
        method : 'GET',
        url    : '/api/me',
    }).then(function(returnData){
        if ( returnData.data.user ) {
            $scope.user = returnData.data.user;
            $scope.userfinancialdata = returnData.data.user.accounts;
        }
    })

    $scope.search = {
        subtypeCash : 'checking',
        subtypeSavings : 'savings'
    };

    $scope.calculateTotal = function(subtype) {
        var total = 0;
        for (var i = 0; i < $scope.userfinancialdata.length; i++) {
            if ($scope.userfinancialdata[i].subtype == subtype) {
                total += $scope.userfinancialdata[i].balance.available;
            }
        }
        return total;
    }
}])


