app.controller('loginController', ['$scope', '$http', 'plaidLink', 'Data', function($scope, $http, plaidLink, Data){
    $http({
        method : 'GET',
        url    : '/api/me',
    }).then(function(returnData){
        console.log(returnData)
        if ( returnData.data.user ) {
            $scope.user = returnData.data.user
        }
    })     

    $scope.signup = function(){
        $http({
            method : 'POST',
            url    : '/signup',
            data   : $scope.signupForm
        }).then(function(returnData){
            console.log(returnData)
            if ( returnData.data.success ) { window.location.href="/dashboard" }
        })
    }

    $scope.login = function(){
        $http({
            method : 'POST',
            url    : '/login',
            data   : $scope.loginForm
        }).then(function(returnData){
            if ( returnData.data.success ) { window.location.href="/dashboard" } 
            else { console.log(returnData)}
        })
    }

    $scope.token = '';
    $scope.plaidIsLoaded = plaidLink.isLoaded;
    plaidLink.create({
        onSuccess: function(token) {
            $scope.token = token;
            $http({
                method : 'GET',
                url    : '/plaidaccounts',
                params   : {public_token: $scope.token}
            }).then(function(returnData){
                Data.setAccounts(returnData.data);
                console.log(Data.getAccounts())
            })
        },
        onExit: function() {
            console.log('user closed');
        }
    });
    $scope.openPlaid = function(bankType) {
        plaidLink.open(bankType);
    };
}])