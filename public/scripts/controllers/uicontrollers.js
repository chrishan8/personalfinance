app.run(function($rootScope) {
    $rootScope.closeright;
})

app.controller('UICtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', 'Data', '$rootScope', function($scope, $timeout, $mdSidenav, $log, $http, Data, $rootScope) {
    // Left and Right Sidenav Configurations
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildDelayedToggler('right');

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

    $scope.closeleft = function () {
      	$mdSidenav('left').close()
        	.then(function () {
          		$log.debug("close LEFT is done");
        	});
    };

    $scope.closeright = function () {
      $mdSidenav('right').close()
        .then(function () {
          $log.debug("close RIGHT is done");
        });
    };

    $rootScope.closeright = function () {
        $mdSidenav('right').close()
            .then(function () {
                $log.debug("close RIGHT is done");
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
            Data.setAccount(returnData.data.user);
            $scope.userfinancialdata = returnData.data.user.accounts;
            $scope.usertransactionsdata = returnData.data.user.transactions;
        }
    })

    // Filter Through General Account Types to Populate Left Sidenav
    $scope.search = {
        subtypeCash : 'checking',
        subtypeSavings : 'savings'
    };
    // Returns the Total For Each Sidenav Category
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

app.controller('personalCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', 'Data', '$rootScope', function($scope, $timeout, $mdSidenav, $log, $http, Data, $rootScope) {
    $scope.closemodule = function() {
        $rootScope.closeright();
    }
    // Use User Data to Populate and Edit Transactions Data on the Right Sidenav
    var user = Data.getAccount();

    // Console Log User Data for Debugging Purposes
    var test = function() {
        console.log(user);
    }
    test();
    $scope.transactions = user.transactions;

    $scope.addressRecorded = function(transaction) {
        if (typeof transaction.meta.location.address !== 'undefined') {
            return true;
        }
        else {
            return false;
        }
    }

    // Pagination Configuration
    $scope.query = {
        limit: 10,
        page: 1,
        options: [10, 20, 30, 40]
    };
}])
