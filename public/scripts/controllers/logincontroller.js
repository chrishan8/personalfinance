login.controller('loginController', ['$scope', '$http', 'plaidLink', '$location', '$anchorScroll', '$mdDialog', '$mdMedia', function($scope, $http, plaidLink, $location, $anchorScroll, $mdDialog, $mdMedia){
    $scope.indexviewjumbotron = function(x) {
        $location.hash('anchor1');
    };
    $scope.indexviewjumbotron();
    $scope.showTabDialog = function(ev) {
        $mdDialog.show({
          controller: 'loginController',
          templateUrl: 'public/templates/login/modal.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose:true
        })
        .then(function(answer) {
            $scope.status = 'You said the information was "' + answer + '".';
        }, function() {
            $scope.status = 'You cancelled the dialog.';
        });
    };

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
                window.location.href="/dashboard";
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

function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
        $mdDialog.hide();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
}