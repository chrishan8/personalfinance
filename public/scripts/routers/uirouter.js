app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('personalspending', {
            url: '/personalspending',
            templateUrl: 'public/templates/personalspending/home.html',
        })
    })