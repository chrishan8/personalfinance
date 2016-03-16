app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('budgetfund', {
            url: '/budgetfund',
            templateUrl: 'public/templates/budgetfund/home.html',
        })
        .state('personalspending', {
        	url: '/personalspending',
        	templateUrl: '/public/templates/personalspending/home.html',
        	controller: 'personalCtrl'
        })
        .state('realestate', {
            url: '/realestate',
            templateUrl: '/public/templates/realestate/home.html',
        })
    })