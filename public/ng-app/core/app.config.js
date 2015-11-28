// routes
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'ng-app/pages/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home',
				secure: true
			})
			.when('/login', {
				templateUrl: 'ng-app/pages/login/Login.view.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.when('/account', {
				templateUrl: 'ng-app/pages/account/Account.view.html',
				controller: 'AccountCtrl',
				controllerAs: 'account',
				secure: true
			})
			.when('/admin', {
				templateUrl: 'ng-app/pages/admin/Admin.view.html',
				controller: 'AdminCtrl',
				controllerAs: 'admin',
				secure: true
			})
			.otherwise({
				templateUrl: 'ng-app/pages/error404/Error404.view.html',
				controller: 'Error404Ctrl',
				controllerAs: 'e404'
			});

		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}
})();