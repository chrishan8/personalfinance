app.controller('loginController', ['$scope', '$http', 'plaidLink', 'Data', function($scope, $http, plaidLink, Data){
    
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

    $scope.register = function() {
        console.log($scope.signupForm);
        $http({
            method : 'POST',
            url    : '/signup',
            data   : $scope.signupForm
        }).then(function(returnData){
            console.log(returnData);
            $scope.userid = returnData.data.id;
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
                params   : {public_token: $scope.token, id: $scope.userid}
            }).then(function(returnData){
                // window.location.href="/dashboard";
                console.log(returnData);
            })
        },
        onExit: function() {
            console.log('user closed');
        }
    });
    $scope.openPlaid = function(bankType) {
        plaidLink.open(bankType);
    };

    $scope.registerPlaid = function () {
        $scope.openPlaid();
    };
}])