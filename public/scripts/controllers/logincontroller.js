app.controller('loginController', ['$scope', '$http', function($scope, $http){
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
}])