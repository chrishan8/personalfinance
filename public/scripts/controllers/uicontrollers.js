app.run(function($rootScope) {
    $rootScope.closeright;
})
app.controller('UICtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', '$rootScope', function($scope, $timeout, $mdSidenav, $log, $http, $rootScope) {
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

    console.log($rootScope.closeright);

    // Populate Sidenav with Data
    $scope.userfinancialdata = [];
    var getprofile = function() {
        $http({
            method : 'GET',
            url    : '/api/me',
        }).then(function(returnData){
            if ( returnData.data.user ) {
                console.log(returnData.data.user);
                $scope.user = returnData.data.user;
                $scope.userfinancialdata = returnData.data.user.accounts;
                $scope.usertransactionsdata = returnData.data.user.transactions;
                $scope.slider = {
                    fixed: $scope.user.slateAccounts.fixed_expenses.budget,
                    invest: $scope.user.slateAccounts.investment.budget,
                    short: $scope.user.slateAccounts.short_term_savings.budget,
                    develop: $scope.user.slateAccounts.personal_development.budget,
                    spend: $scope.user.slateAccounts.personal_spending.budget,
                    retire: $scope.user.slateAccounts.retirement.budget
                }
            }
        })
    }
    getprofile();

    // Filter Through General Account Types to Populate Left Sidenav
    $scope.search = {
        subtypeCash : 'checking',
        subtypeSavings : 'savings'
    };
    // Returns the Total For Each Sidenav Category
    $scope.calculateTotal = function(subtype) {
        var total = 0;
        var check = 'checking'
        for (var i = 0; i < $scope.userfinancialdata.length; i++) {
            if ($scope.userfinancialdata[i].subtype == subtype) {
                total += $scope.userfinancialdata[i].balance.available;
            }
        }
        return total;
    }

    $scope.updateAccounts = function() {
        if ($scope.user.access_token == '' || typeof $scope.user.access_token == 'undefined') {
            $scope.token = '';
            $scope.plaidIsLoaded = plaidLink.isLoaded;
            plaidLink.create({
                onSuccess: function(token) {
                    $scope.token = token;
                    $http({
                        method : 'GET',
                        url    : '/plaidaccounts',
                        params   : {public_token: $scope.token, id: $scope.user._id}
                    }).then(function(returnData){
                        $http({
                            method : 'GET',
                            url    : '/api/me',
                        }).then(function(returnData){
                            if ( returnData.data.user ) {
                                console.log(returnData.data.user);
                                $scope.user = returnData.data.user;
                                $scope.userfinancialdata = returnData.data.user.accounts;
                                $scope.usertransactionsdata = returnData.data.user.transactions;
                            }
                        })
                    })
                },
                onExit: function() {
                    console.log('user closed');
                }
            });
            $scope.openPlaid = function(bankType) {
                plaidLink.open(bankType);
            };
            $scope.openPlaid();
        }
        else {
            $http({
            method : 'GET',
            url    : '/api/updateAccounts',
            params : {id: $scope.user._id, access_token: $scope.user.access_token}
            }).then(function(returnData){
                $http({
                    method : 'GET',
                    url    : '/api/me',
                }).then(function(returnData){
                    if ( returnData.data.user ) {
                        console.log(returnData.data.user);
                        $scope.user = returnData.data.user;
                        $scope.userfinancialdata = returnData.data.user.accounts;
                        $scope.usertransactionsdata = returnData.data.user.transactions;
                    }
                })
            })
        }
    }

    // Control For Budgetting Funds 
    


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

    $scope.getTypes = function() {
        var types = [
            'Fixed Expenses',
            'Investment',
            'Short-Term Savings',
            'Personal Development',
            'Personal Spending',
            'Retirement'
        ]
        return types;
    }

    $scope.fundbudget = function() {
        console.log($scope.slider);
        $http({
            method : 'POST',
            url    : '/api/fundbudget',
            data   : [$scope.slider , {id: $scope.user._id}]
        }).then(function(returnData){
            console.log(returnData.data);
        })
    }

    $scope.categorizetransaction = function(transaction) {
        console.log(transaction);
        $http({
            method : 'POST',
            url    : '/api/categorizetransaction',
            data   : [transaction, {id: $scope.user._id}]
        }).then(function(returnData){
            $http({
                method : 'GET',
                url    : '/api/me',
            }).then(function(returnData){
                if ( returnData.data.user ) {
                    console.log(returnData.data.user);
                    $scope.user = returnData.data.user;
                    $scope.userfinancialdata = returnData.data.user.accounts;
                    $scope.usertransactionsdata = returnData.data.user.transactions;
                }
            })
        })
    }

    var calculateAccountsTotal = function() {
        $http({
                method : 'GET',
                url    : '/api/me',
            }).then(function(returnData){
                if ( returnData.data.user ) {
                    $scope.user = returnData.data.user;
                    var total = {fixed: 0, invest: 0, short: 0, develop: 0, spend: 0, retire: 0};
                    var calculate = function() {
                        for (var i = 0; i < $scope.user.slateAccounts.fixed_expenses.transactions.length; i++) {
                            total.fixed += $scope.user.slateAccounts.fixed_expenses.transactions[i].amount;
                        }
                        for (var i = 0; i < $scope.user.slateAccounts.investment.transactions.length; i++) {
                            total.invest += $scope.user.slateAccounts.investment.transactions[i].amount;
                        }
                        for (var i = 0; i < $scope.user.slateAccounts.short_term_savings.transactions.length; i++) {
                            total.invest += $scope.user.slateAccounts.short_term_savings.transactions[i].amount;
                        }
                        for (var i = 0; i < $scope.user.slateAccounts.personal_development.transactions.length; i++) {
                            total.develop += $scope.user.slateAccounts.personal_development.transactions[i].amount;
                        }
                        for (var i = 0; i < $scope.user.slateAccounts.personal_spending.transactions.length; i++) {
                            total.spend += $scope.user.slateAccounts.personal_spending.transactions[i].amount;
                        }
                        for (var i = 0; i < $scope.user.slateAccounts.retirement.transactions.length; i++) {
                            total.retire += $scope.user.slateAccounts.retirement.transactions[i].amount;
                        }
                        return total;
                    }
                }
                $scope.AccountsTotal = calculate();
                console.log($scope.AccountsTotal)
            })
    }
    calculateAccountsTotal();
}])

app.controller('personalCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', '$rootScope', function($scope, $timeout, $mdSidenav, $log, $http, $rootScope) {
    var getprofile = function() {
        $http({
            method : 'GET',
            url    : '/api/me',
        }).then(function(returnData){
            if ( returnData.data.user ) {
                console.log(returnData.data.user);
                $scope.user = returnData.data.user;
            }
        })
    }
    getprofile();

    $scope.closeright = $rootScope.closeright

    var data1 = ['Groceries']
    var data2 = ['Clothes']
    var data3 = ['Restaurants']
    var data4 = ['Coffee, Alcohol & Misc']
    var data5 = ['Health']
    var data6 = ['Recreation']
    var data7 = ['Gift']
    var data8 = ['Books & Supplies']

    var sortspenddata = function() {
        for (var i = 0; i < $scope.user.slateAccounts.personal_spending.transactions.length; i++) {
            if (typeof $scope.user.slateAccounts.personal_spending.transactions[i].category != 'undefined') {
                if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Groceries') {
                    data1.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Clothes') {
                    data2.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Restaurants') {
                    data3.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Coffee, Alcohol & Misc') {
                    data4.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Health') {
                    data5.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Recreation') {
                    data6.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Gift') {
                    data7.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
                else if ($scope.user.slateAccounts.personal_spending.transactions[i].category[0] == 'Books & Supplies') {
                    data8.push($scope.user.slateAccounts.personal_spending.transactions[i].amount);
                }
            }
            else {
                console.log('undefined');
            }
        }
    }
    sortspenddata();

    var chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
            ],
            type : 'pie',
            onclick: function (d, i) { console.log("onclick", d, i); },
            onmouseover: function (d, i) { console.log("onmouseover", d, i); },
            onmouseout: function (d, i) { console.log("onmouseout", d, i); }
        }
    });

    setTimeout(function () {
        chart.load({
            columns: [
                data1,
                data2,
                data3,
                data4,
                data5,
                data6,
                data7,
                data8
            ]
        });
    }, 1500);

    $scope.getCategories = function() {
        var types = [
            'Groceries',
            'Clothes',
            'Restaurants',
            'Coffee, Alcohol & Misc',
            'Health',
            'Recreation',
            'Gift',
            'Books & Supplies',
        ]
        return types;
    }

    $scope.categorizespending = function(transaction) {
        console.log(transaction);
        $http({
            method : 'POST',
            url    : '/api/categorizespending',
            data   : [transaction, {id: $scope.user._id}]
        }).then(function(returnData){
            console.log(returnData.data)
            $http({
                method : 'GET',
                url    : '/api/me',
            }).then(function(returnData){
                if ( returnData.data.user ) {
                    console.log(returnData.data.user);
                    $scope.user = returnData.data.user;
                }
            })
        })
    }
}])

app.controller('paperCtrl', ['$scope', '$timeout', '$mdSidenav', '$log', '$http', function($scope, $timeout, $mdSidenav, $log, $http) {
    
}])
