app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider
        .state('landing', {
            url: '/',
            templateUrl: 'public/templates/signup/landingpage.html',
            controller: 'loginController'
        })
    })