(function() {
	'use strict';

	angular
		.module('reStart-mean', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'resize', 'satellizer']);
})();
// media query constants
(function() {
	'use strict';

	var MQ = {
		SMALL: '(max-width: 767px)',
		LARGE: '(min-width: 768px)'
	};

	angular
		.module('reStart-mean')
		.constant('MQ', MQ);
})();
// login/Oauth constants
(function() {
	'use strict';

	var OAUTH = {
		LOGINS: [
			{
				account: 'google',
				name: 'Google',
				url: 'http://accounts.google.com'
			}, {
				account: 'twitter',
				name: 'Twitter',
				url: 'http://twitter.com'
			}, {
				account: 'facebook',
				name: 'Facebook',
				url: 'http://facebook.com'
			}, {
				account: 'github',
				name: 'GitHub',
				url: 'http://github.com'
			}
		]
	};

	angular
		.module('reStart-mean')
		.constant('OAUTH', OAUTH);
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', 'MQ', 'mediaCheck'];

	function PageCtrl(Page, $scope, MQ, mediaCheck) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;
		// Set up functionality to run on enter/exit of media query
		var mc = mediaCheck.init({
			scope: $scope,
			media: {
				mq: MQ.SMALL,
				enter: _enterMobile,
				exit: _exitMobile
			},
			debounce: 200
		});

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// associate page <title>
			page.pageTitle = Page;

			$scope.$on('$routeChangeStart', _routeChangeStart);
			$scope.$on('$routeChangeSuccess', _routeChangeSuccess);
			$scope.$on('$routeChangeError', _routeChangeError);
		}

		/**
		 * Enter mobile media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @private
		 */
		function _enterMobile() {
			$scope.$broadcast('enter-mobile');
		}

		/**
		 * Exit mobile media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @private
		 */
		function _exitMobile() {
			$scope.$broadcast('exit-mobile');
		}

		/**
		 * Turn on loading state
		 *
		 * @private
		 */
		function _loadingOn() {
			$scope.$broadcast('loading-on');
		}

		/**
		 * Turn off loading state
		 *
		 * @private
		 */
		function _loadingOff() {
			$scope.$broadcast('loading-off');
		}

		/**
		 * Route change start handler
		 * If next route has resolve, turn on loading
		 *
		 * @param $event {object}
		 * @param next {object}
		 * @param current {object}
		 * @private
		 */
		function _routeChangeStart($event, next, current) {
			if (next.$$route.resolve) {
				_loadingOn();
			}
		}

		/**
		 * Route change success handler
		 * Match current media query and run appropriate function
		 * If current route has been resolved, turn off loading
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @private
		 */
		function _routeChangeSuccess($event, current, previous) {
			mc.matchCurrent(MQ.SMALL);

			if (current.$$route.resolve) {
				_loadingOff();
			}
		}

		/**
		 * Route change error handler
		 * Handle route resolve failures
		 *
		 * @param $event {object}
		 * @param current {object}
		 * @param previous {object}
		 * @param rejection {object}
		 * @private
		 */
		function _routeChangeError($event, current, previous, rejection) {
			if (_handlingRouteChangeError) {
				return;
			}

			_handlingRouteChangeError = true;
			_loadingOff();

			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			console.log(msg);

			/**
			 * On routing error, show an error.
			 */
			alert('An error occurred. Please try again.');
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('Page', Page);

	function Page() {
		// private vars
		var siteTitle = 'reStart-mean';
		var pageTitle = 'Home';

		// callable members
		return {
			getTitle: getTitle,
			setTitle: setTitle
		};

		/**
		 * Title function
		 * Sets site title and page title
		 *
		 * @returns {string} site title + page title
		 */
		function getTitle() {
			return siteTitle + ' | ' + pageTitle;
		}

		/**
		 * Set page title
		 *
		 * @param newTitle {string}
		 */
		function setTitle(newTitle) {
			pageTitle = newTitle;
		}
	}
})();
// User functions
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('User', User);

	User.$inject = ['OAUTH'];

	function User(OAUTH) {
		// callable members
		return {
			getLinkedAccounts: getLinkedAccounts
		};

		/**
		 * Create array of a user's currently-linked account logins
		 *
		 * @param userObj
		 * @returns {Array}
		 */
		function getLinkedAccounts(userObj) {
			var linkedAccounts = [];

			angular.forEach(OAUTH.LOGINS, function(actObj) {
				var act = actObj.account;

				if (userObj[act]) {
					linkedAccounts.push(act);
				}
			});

			return linkedAccounts;
		}
	}
})();
// application $auth constants
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.constant('APPAUTH', {
			LOGIN_URL: {
				// change PROD domain to your own
				PROD: 'http://restart-mean.kmaida.net/auth/login',
				DEV: 'http://localhost:8081/auth/login'
			},
			CLIENTIDS: {
				// change these client IDs to your own
				FACEBOOK: '343789249146966',
				GOOGLE: '479651367330-trvf8efoo415ie0usfhm4i59410vk3j9.apps.googleusercontent.com',
				GITHUB: '8096e95c2eba33b81adb'
			}
		});
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.config(authConfig)
		.run(authRun);

	authConfig.$inject = ['$authProvider', 'APPAUTH'];
	/**
	 * AngularJS .config() function
	 *
	 * @param $authProvider - Satellizer provider
	 * @param APPAUTH {object} app auth constants
	 */
	function authConfig($authProvider, APPAUTH) {
		// because providers (ie, $location, $window) cannot be injected in config,
		// dev/prod login URLs must be swapped manually

		//$authProvider.loginUrl = APPAUTH.LOGIN_URL.DEV;
		$authProvider.loginUrl = APPAUTH.LOGIN_URL.PROD;

		$authProvider.facebook({
			clientId: APPAUTH.CLIENTIDS.FACEBOOK
		});

		$authProvider.google({
			clientId: APPAUTH.CLIENTIDS.GOOGLE
		});

		$authProvider.twitter({
			url: '/auth/twitter'
		});

		$authProvider.github({
			clientId: APPAUTH.CLIENTIDS.GITHUB
		});
	}

	authRun.$inject = ['$rootScope', '$location', '$auth'];
	/**
	 * AngularJS .run() function
	 *
	 * @param $rootScope
	 * @param $location
	 * @param $auth
	 */
	function authRun($rootScope, $location, $auth) {
		$rootScope.$on('$routeChangeStart', function(event, next, current) {
			var _path;

			if (next && next.$$route && next.$$route.secure && !$auth.isAuthenticated()) {
				_path = $location.path();

				$rootScope.authPath = _path.indexOf('login') === -1 ? _path : '/';

				$rootScope.$evalAsync(function() {
					// send user to login
					$location.path('/login');
				});
			}
		});
	}

})();
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
				redirectTo: '/'
			});

		$locationProvider
			.html5Mode({
				enabled: true
			})
			.hashPrefix('!');
	}
})();
(function() {

	angular
		.module('reStart-mean')
		.directive('detectAdblock', detectAdblock);

	detectAdblock.$inject = ['$timeout', '$location'];

	function detectAdblock($timeout, $location) {
		// return directive
		return {
			restrict: 'EA',
			link: detectAdblockLink,
			template:   '<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div>' +
			'<div ng-if="ab.blocked" class="ab-message alert alert-danger">' +
			'<i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.' +
			'</div>'
		};

		/**
		 * detectAdblock LINK function
		 *
		 * @param $scope
		 * @param $elem
		 * @param $attrs
		 */
		function detectAdblockLink($scope, $elem, $attrs) {
			// data object
			$scope.ab = {};

			// hostname for messaging
			$scope.ab.host = $location.host();

			$timeout(_areAdsBlocked, 200);

			/**
			 * Check if ads are blocked - called in $timeout to let AdBlockers run
			 *
			 * @private
			 */
			function _areAdsBlocked() {
				var _a = $elem.find('.ad-test');

				$scope.ab.blocked = _a.height() <= 0 || !$elem.find('.ad-test:visible').length;
			}
		}
	}

})();
// Fetch local JSON data
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('localData', localData);

	localData.$inject = ['$http'];

	function localData($http) {
		/**
		 * Promise response function
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 * Useful for APIs (ie, with nginx) where server error HTML page may be returned in error
		 *
		 * @param response {*} data from $http
		 * @returns {*} object, array
		 * @private
		 */
		function _successRes(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				throw new Error('retrieved data is not typeof object.');
			}
		}

		/**
		 * Promise response function - error
		 * Throws an error with error data
		 *
		 * @param error {object}
		 * @private
		 */
		function _errorRes(error) {
			throw new Error('Error retrieving data', error);
		}

		/**
		 * Get local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getJSON() {
			return $http
				.get('/ng-app/data/data.json')
				.then(_successRes, _errorRes);
		}

		// callable members
		return {
			getJSON: getJSON
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.filter('trustAsHTML', trustAsHTML);

	trustAsHTML.$inject = ['$sce'];

	function trustAsHTML($sce) {
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}
})();
// User directive
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.directive('user', user);

	function user() {
		// return directive
		return {
			restrict: 'EA',
			controller: userCtrl,
			controllerAs: 'u',
			bindToController: true,
			template: '<div ng-if="u.isAuthenticated() && !!u.user" class="user clearfix"><img ng-if="!!u.user.picture" ng-src="{{u.user.picture}}" class="user-picture" /><span class="user-displayName">{{u.user.displayName}}</span></div>'
		};
	}

	userCtrl.$inject = ['userData', '$auth'];
	/**
	 * User directive controller
	 */
	function userCtrl(userData, $auth) {
		// controllerAs ViewModel
		var u = this;

		// bindable members
		u.isAuthenticated = _isAuthenticated;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// API request to get the user, passing success callback function that sets the user's info
			userData.getUser().then(_userSuccess);
		}

		/**
		 * Check if the current user is authenticated
		 *
		 * @returns {boolean}
		 * @private
		 */
		function _isAuthenticated() {
			return $auth.isAuthenticated();
		}

		/**
		 * Successful user promise
		 *
		 * @param data {object}
		 * @private
		 */
		function _userSuccess(data) {
			u.user = data;
		}
	}
})();
// User API $http calls
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('userData', userData);

	userData.$inject = ['$http'];

	function userData($http) {
		// callable members
		return {
			getUser: getUser,
			updateUser: updateUser,
			getAllUsers: getAllUsers
		};

		/**
		 * Promise response function
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 *
		 * @param response {*} data from $http
		 * @returns {*} object, array
		 * @private
		 */
		function _successRes(response) {
			if (typeof response.data === 'object') {
				return response.data;
			} else {
				throw new Error('retrieved data is not typeof object.');
			}
		}

		/**
		 * Promise response function - error
		 * Throws an error with error data
		 *
		 * @param error {object}
		 * @private
		 */
		function _errorRes(error) {
			throw new Error('Error retrieving data', error);
		}

		/**
		 * Get current user's data
		 *
		 * @returns {promise}
		 */
		function getUser() {
			return $http
				.get('/api/me')
				.then(_successRes, _errorRes);
		}

		/**
		 * Update current user's profile data
		 *
		 * @param profileData {object}
		 * @returns {promise}
		 */
		function updateUser(profileData) {
			return $http
				.put('/api/me', profileData);
		}

		/**
		 * Get all users (admin authorized only)
		 *
		 * @returns {promise}
		 */
		function getAllUsers() {
			return $http
				.get('/api/users')
				.then(_successRes, _errorRes);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'localData', '$auth', 'userData'];

	function headerCtrl($scope, $location, localData, $auth, userData) {
		// controllerAs ViewModel
		var header = this;

		// bindable members
		header.logout = _logout;
		header.isAuthenticated = _isAuthenticated;
		header.indexIsActive = _indexIsActive;
		header.navIsActive = _navIsActive;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// get local data
			localData.getJSON().then(_localDataSuccess);

			// check if user is an admin
			_checkUserAdmin();

			// check if user is an admin on location change
			$scope.$on('$locationChangeSuccess', _checkUserAdmin);
		}

		/**
		 * Successfully retrieved local data
		 *
		 * @param data
		 * @private
		 */
		function _localDataSuccess(data) {
			header.localData = data;
		}

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		function _logout() {
			header.adminUser = undefined;
			$auth.logout();
			$location.path('/login');
		}

		/**
		 * If user is authenticated and adminUser is undefined,
		 * get the user and set adminUser boolean.
		 *
		 * Do this on first controller load (init, refresh)
		 * and subsequent location changes (ie, catching logout, login, etc).
		 *
		 * @private
		 */
		function _checkUserAdmin() {
			// if user is authenticated and not defined yet, check if they're an admin
			if ($auth.isAuthenticated() && header.adminUser === undefined) {
				userData.getUser()
					.then(function(data) {
						header.adminUser = data.isAdmin;
					});
			}
		}

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 * @private
		 */
		function _isAuthenticated() {
			return $auth.isAuthenticated();
		}

		/**
		 * Currently active nav item when '/' index
		 *
		 * @param {string} path
		 * @returns {boolean}
		 * @private
		 */
		function _indexIsActive(path) {
			// path should be '/'
			return $location.path() === path;
		}

		/**
		 * Currently active nav item
		 *
		 * @param {string} path
		 * @returns {boolean}
		 * @private
		 */
		function _navIsActive(path) {
			return $location.path().substr(0, path.length) === path;
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.directive('navControl', navControl);

	navControl.$inject = ['$window', 'resize'];

	function navControl($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			link: navControlLink
		};

		/**
		 * navControl LINK function
		 *
		 * @param $scope
		 */
		function navControlLink($scope) {
			// data model
			$scope.nav = {};

			// private variables
			var _$body = angular.element('body');
			var _layoutCanvas = _$body.find('.layout-canvas');
			var _navOpen;

			_init();

			/**
			 * INIT function executes procedural code
			 *
			 * @private
			 */
			function _init() {
				// initialize debounced resize
				var _rs = resize.init({
					scope: $scope,
					resizedFn: _resized,
					debounce: 100
				});

				$scope.$on('$locationChangeStart', _$locationChangeStart);
				$scope.$on('enter-mobile', _enterMobile);
				$scope.$on('exit-mobile', _exitMobile);
			}

			/**
			 * Resized window (debounced)
			 *
			 * @private
			 */
			function _resized() {
				_layoutCanvas.css({
					minHeight: $window.innerHeight + 'px'
				});
			}

			/**
			 * Open mobile navigation
			 *
			 * @private
			 */
			function _openNav() {
				_$body
					.removeClass('nav-closed')
					.addClass('nav-open');

				_navOpen = true;
			}

			/**
			 * Close mobile navigation
			 *
			 * @private
			 */
			function _closeNav() {
				_$body
					.removeClass('nav-open')
					.addClass('nav-closed');

				_navOpen = false;
			}

			/**
			 * Toggle nav open/closed
			 */
			function toggleNav() {
				if (!_navOpen) {
					_openNav();
				} else {
					_closeNav();
				}
			}

			/**
			 * When changing location, close the nav if it's open
			 */
			function _$locationChangeStart() {
				if (_navOpen) {
					_closeNav();
				}
			}

			/**
			 * Function to execute when entering mobile media query
			 * Close nav and set up menu toggling functionality
			 *
			 * @private
			 */
			function _enterMobile(mq) {
				_closeNav();

				// bind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = toggleNav;
			}

			/**
			 * Function to execute when exiting mobile media query
			 * Disable menu toggling and remove body classes
			 *
			 * @private
			 */
			function _exitMobile(mq) {
				// unbind function to toggle mobile navigation open/closed
				$scope.nav.toggleNav = null;

				_$body.removeClass('nav-closed nav-open');
			}
		}
	}

})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['$auth', 'userData', 'User', 'Page'];

	function AdminCtrl($auth, userData, User, Page) {
		// controllerAs ViewModel
		var admin = this;

		// bindable members
		admin.isAuthenticated = _isAuthenticated;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Admin');

			userData.getAllUsers().then(_getAllUsersSuccess, _getAllUsersError);
		}

		/**
		 * Determines if the user is authenticated
		 *
		 * @returns {boolean}
		 * @private
		 */
		function _isAuthenticated() {
			return $auth.isAuthenticated();
		}

		/**
		 * Function for successful API call getting user list
		 * Show Admin UI
		 * Display list of users
		 *
		 * @param data {Array} promise provided by $http success
		 * @private
		 */
		function _getAllUsersSuccess(data) {
			admin.users = data;

			angular.forEach(admin.users, function(user) {
				user.linkedAccounts = User.getLinkedAccounts(user);
			});

			admin.showAdmin = true;
		}

		/**
		 * Function for unsuccessful API call getting user list
		 * Show Unauthorized error
		 *
		 * @param error {error} response
		 * @private
		 */
		function _getAllUsersError(error) {
			admin.showAdmin = false;
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', '$auth', 'userData', '$timeout', 'OAUTH', 'User', 'Page'];

	function AccountCtrl($scope, $auth, userData, $timeout, OAUTH, User, Page) {
		// controllerAs ViewModel
		var account = this;

		// bindable members
		account.logins = OAUTH.LOGINS;  // All available login services
		account.isAuthenticated = _isAuthenticated;
		account.getProfile = _getProfile;
		account.updateProfile = _updateProfile;
		account.link = _link;
		account.unlink = _unlink;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Account');

			_btnSaveReset();

			// watch for display name updates
			$scope.$watch('account.user.displayName', _$watchDisplayName);

			// get profile
			account.getProfile();
		}

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		function _isAuthenticated() {
			return $auth.isAuthenticated();
		}

		/**
		 * Get user's profile information
		 */
		function _getProfile() {
			userData.getUser().then(_getUserSuccess, _getUserError);
		}

		/**
		 * Function for successful API call getting user's profile data
		 * Show Account UI
		 *
		 * @param data {object} promise provided by $http success
		 * @private
		 */
		function _getUserSuccess(data) {
			account.user = data;
			account.administrator = account.user.isAdmin;
			account.linkedAccounts = User.getLinkedAccounts(account.user, 'account');
			account.showAccount = true;
		}

		/**
		 * Function for error API call getting user's profile data
		 * Show an error alert in the UI
		 *
		 * @param error
		 * @private
		 */
		function _getUserError(error) {
			account.errorGettingUser = true;
		}

		/**
		 * Reset profile save button to initial state
		 *
		 * @private
		 */
		function _btnSaveReset() {
			account.btnSaved = false;
			account.btnSaveText = 'Save';
		}

		/**
		 * Watch display name changes to check for empty or null string
		 * Set button text accordingly
		 *
		 * @param newVal {string} updated displayName value from input field
		 * @param oldVal {*} previous displayName value
		 * @private
		 */
		function _$watchDisplayName(newVal, oldVal) {
			if (newVal === '' || newVal === null) {
				account.btnSaveText = 'Enter Name';
			} else {
				account.btnSaveText = 'Save';
			}
		}

		/**
		 * Update user's profile information
		 * Called on submission of update form
		 */
		 function _updateProfile() {
			var profileData = { displayName: account.user.displayName };

			if (!!account.user.displayName) {
				// Set status to Saving... and update upon success or error in callbacks
				account.btnSaveText = 'Saving...';

				// Update the user, passing profile data and assigning success and error callbacks
				userData.updateUser(profileData).then(_updateSuccess, _updateError);
			}
		}

		/**
		 * Success callback when profile has been updated
		 *
		 * @private
		 */
		function _updateSuccess() {
			account.btnSaved = true;
			account.btnSaveText = 'Saved!';

			$timeout(_btnSaveReset, 2500);
		}

		/**
		 * Error callback when profile update has failed
		 *
		 * @private
		 */
		function _updateError() {
			account.btnSaved = 'error';
			account.btnSaveText = 'Error saving!';
		}

		/**
		 * Link third-party provider
		 *
		 * @param {string} provider
		 */
		function _link(provider) {
			$auth.link(provider)
				.then(account.getProfile)
				.catch(function(response) {
					alert(response.data.message);
				});
		}

		/**
		 * Unlink third-party provider
		 *
		 * @param {string} provider
		 */
		function _unlink(provider) {
			$auth.unlink(provider)
				.then(function() {
					account.getProfile();
				})
				.catch(function(response) {
					alert(response.data ? response.data.message : 'Could not unlink ' + provider + ' account');
				});
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', '$auth', 'localData', 'Page'];

	function HomeCtrl($scope, $auth, localData, Page) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.stringOfHTML = '<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!';
		home.isAuthenticated = _isAuthenticated;
		home.viewformat = null;
		home.localData = null;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Home');

			// get local data
			localData.getJSON().then(_localDataSuccess);

			// setup mediaquery functions defining home.viewformat
			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);
		}

		/**
		 * Determines if the user is authenticated
		 *
		 * @returns {boolean}
		 * @private
		 */
		function _isAuthenticated() {
			return $auth.isAuthenticated();
		}

		/**
		 * Get local data from static JSON
		 *
		 * @param data (successful promise returns)
		 * @returns {object} data
		 */
		function _localDataSuccess(data) {
			home.localData = data;
		}

		/**
		 * Enter small mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _enterMobile() {
			home.viewformat = 'small';
		}

		/**
		 * Exit small mq
		 * Set home.viewformat
		 *
		 * @private
		 */
		function _exitMobile() {
			home.viewformat = 'large';
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('LoginCtrl', LoginCtrl);

	LoginCtrl.$inject = ['$auth', 'OAUTH', '$rootScope', '$location', 'localData', 'Page'];

	function LoginCtrl($auth, OAUTH, $rootScope, $location, localData, Page) {
		// controllerAs ViewModel
		var login = this;

		// bindable members
		login.logins = OAUTH.LOGINS;
		login.loggingIn = false;
		login.authenticate = _authenticate;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle('Login');

			// get local data
			localData.getJSON().then(_localDataSuccess);
		}

		/**
		 * Function to run when local data successful
		 *
		 * @param data {JSON}
		 * @private
		 */
		function _localDataSuccess(data) {
			login.localData = data;
		}

		/**
		 * Authenticate the user via Oauth with the specified provider
		 *
		 * @param {string} provider - (twitter, facebook, github, google)
		 */
		function _authenticate(provider) {
			login.loggingIn = true;

			$auth.authenticate(provider)
				.then(_authSuccess)
				.catch(_authCatch);
		}

		/**
		 * Successfully authenticated
		 * Go to initially intended authenticated path
		 *
		 * @param response {object} promise response
		 * @private
		 */
		function _authSuccess(response) {
			login.loggingIn = false;

			if ($rootScope.authPath) {
				$location.path($rootScope.authPath);
			} else {
				$location.path('/');
			}
		}

		/**
		 * Failure authenticating
		 *
		 * @param response {object}
		 * @private
		 */
		function _authCatch(response) {
			console.log(response.data);
			login.loggingIn = 'error';
			login.loginMsg = ''
		}
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLkFVVEguY29uc3RhbnQuanMiLCJjb3JlL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAuY29uZmlnLmpzIiwiY29yZS9kZXRlY3RBZGJsb2NrLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLmZhY3RvcnkuanMiLCJjb3JlL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsImNvcmUvdXNlci5kaXIuanMiLCJjb3JlL3VzZXJEYXRhLmZhY3RvcnkuanMiLCJtb2R1bGVzL2hlYWRlci9IZWFkZXIuY3RybC5qcyIsIm1vZHVsZXMvaGVhZGVyL25hdkNvbnRyb2wuZGlyLmpzIiwicGFnZXMvYWRtaW4vQWRtaW4uY3RybC5qcyIsInBhZ2VzL2FjY291bnQvQWNjb3VudC5jdHJsLmpzIiwicGFnZXMvaG9tZS9Ib21lLmN0cmwuanMiLCJwYWdlcy9sb2dpbi9Mb2dpbi5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicsIFsnbmdSb3V0ZScsICduZ1Jlc291cmNlJywgJ25nU2FuaXRpemUnLCAnbmdNZXNzYWdlcycsICdtZWRpYUNoZWNrJywgJ3Jlc2l6ZScsICdzYXRlbGxpemVyJ10pO1xufSkoKTsiLCIvLyBtZWRpYSBxdWVyeSBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBNUSA9IHtcblx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdH07XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmNvbnN0YW50KCdNUScsIE1RKTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgT0FVVEggPSB7XG5cdFx0TE9HSU5TOiBbXG5cdFx0XHR7XG5cdFx0XHRcdGFjY291bnQ6ICdnb29nbGUnLFxuXHRcdFx0XHRuYW1lOiAnR29vZ2xlJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL2FjY291bnRzLmdvb2dsZS5jb20nXG5cdFx0XHR9LCB7XG5cdFx0XHRcdGFjY291bnQ6ICd0d2l0dGVyJyxcblx0XHRcdFx0bmFtZTogJ1R3aXR0ZXInLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vdHdpdHRlci5jb20nXG5cdFx0XHR9LCB7XG5cdFx0XHRcdGFjY291bnQ6ICdmYWNlYm9vaycsXG5cdFx0XHRcdG5hbWU6ICdGYWNlYm9vaycsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9mYWNlYm9vay5jb20nXG5cdFx0XHR9LCB7XG5cdFx0XHRcdGFjY291bnQ6ICdnaXRodWInLFxuXHRcdFx0XHRuYW1lOiAnR2l0SHViJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL2dpdGh1Yi5jb20nXG5cdFx0XHR9XG5cdFx0XVxuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb25zdGFudCgnT0FVVEgnLCBPQVVUSCk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICdNUScsICdtZWRpYUNoZWNrJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSwgJHNjb3BlLCBNUSwgbWVkaWFDaGVjaykge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSBmYWxzZTtcblx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdHZhciBtYyA9IG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bWVkaWE6IHtcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBfcm91dGVDaGFuZ2VTdGFydCk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdWNjZXNzJywgX3JvdXRlQ2hhbmdlU3VjY2Vzcyk7XG5cdFx0XHQkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VFcnJvcicsIF9yb3V0ZUNoYW5nZUVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdleGl0LW1vYmlsZScpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFR1cm4gb24gbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09uKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb24nKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9mZiBsb2FkaW5nIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nT2ZmKCkge1xuXHRcdFx0JHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN0YXJ0IGhhbmRsZXJcblx0XHQgKiBJZiBuZXh0IHJvdXRlIGhhcyByZXNvbHZlLCB0dXJuIG9uIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gbmV4dCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdGFydCgkZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdGlmIChuZXh0LiQkcm91dGUucmVzb2x2ZSkge1xuXHRcdFx0XHRfbG9hZGluZ09uKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIHN1Y2Nlc3MgaGFuZGxlclxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqIElmIGN1cnJlbnQgcm91dGUgaGFzIGJlZW4gcmVzb2x2ZWQsIHR1cm4gb2ZmIGxvYWRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBwcmV2aW91cyB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3VjY2VzcygkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzKSB7XG5cdFx0XHRtYy5tYXRjaEN1cnJlbnQoTVEuU01BTEwpO1xuXG5cdFx0XHRpZiAoY3VycmVudC4kJHJvdXRlLnJlc29sdmUpIHtcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cdFx0XHRfbG9hZGluZ09mZigpO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XG5cblx0ZnVuY3Rpb24gUGFnZSgpIHtcblx0XHQvLyBwcml2YXRlIHZhcnNcblx0XHR2YXIgc2l0ZVRpdGxlID0gJ3JlU3RhcnQtbWVhbic7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdIb21lJztcblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFRpdGxlIGZ1bmN0aW9uXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArICcgfCAnICsgcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG5cdFVzZXIuJGluamVjdCA9IFsnT0FVVEgnXTtcblxuXHRmdW5jdGlvbiBVc2VyKE9BVVRIKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMaW5rZWRBY2NvdW50czogZ2V0TGlua2VkQWNjb3VudHNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIGFwcGxpY2F0aW9uICRhdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmNvbnN0YW50KCdBUFBBVVRIJywge1xuXHRcdFx0TE9HSU5fVVJMOiB7XG5cdFx0XHRcdC8vIGNoYW5nZSBQUk9EIGRvbWFpbiB0byB5b3VyIG93blxuXHRcdFx0XHRQUk9EOiAnaHR0cDovL3Jlc3RhcnQtbWVhbi5rbWFpZGEubmV0L2F1dGgvbG9naW4nLFxuXHRcdFx0XHRERVY6ICdodHRwOi8vbG9jYWxob3N0OjgwODEvYXV0aC9sb2dpbidcblx0XHRcdH0sXG5cdFx0XHRDTElFTlRJRFM6IHtcblx0XHRcdFx0Ly8gY2hhbmdlIHRoZXNlIGNsaWVudCBJRHMgdG8geW91ciBvd25cblx0XHRcdFx0RkFDRUJPT0s6ICczNDM3ODkyNDkxNDY5NjYnLFxuXHRcdFx0XHRHT09HTEU6ICc0Nzk2NTEzNjczMzAtdHJ2ZjhlZm9vNDE1aWUwdXNmaG00aTU5NDEwdmszajkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxuXHRcdFx0XHRHSVRIVUI6ICc4MDk2ZTk1YzJlYmEzM2I4MWFkYidcblx0XHRcdH1cblx0XHR9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ0FQUEFVVEgnXTtcblx0LyoqXG5cdCAqIEFuZ3VsYXJKUyAuY29uZmlnKCkgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtICRhdXRoUHJvdmlkZXIgLSBTYXRlbGxpemVyIHByb3ZpZGVyXG5cdCAqIEBwYXJhbSBBUFBBVVRIIHtvYmplY3R9IGFwcCBhdXRoIGNvbnN0YW50c1xuXHQgKi9cblx0ZnVuY3Rpb24gYXV0aENvbmZpZygkYXV0aFByb3ZpZGVyLCBBUFBBVVRIKSB7XG5cdFx0Ly8gYmVjYXVzZSBwcm92aWRlcnMgKGllLCAkbG9jYXRpb24sICR3aW5kb3cpIGNhbm5vdCBiZSBpbmplY3RlZCBpbiBjb25maWcsXG5cdFx0Ly8gZGV2L3Byb2QgbG9naW4gVVJMcyBtdXN0IGJlIHN3YXBwZWQgbWFudWFsbHlcblxuXHRcdC8vJGF1dGhQcm92aWRlci5sb2dpblVybCA9IEFQUEFVVEguTE9HSU5fVVJMLkRFVjtcblx0XHQkYXV0aFByb3ZpZGVyLmxvZ2luVXJsID0gQVBQQVVUSC5MT0dJTl9VUkwuUFJPRDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IEFQUEFVVEguQ0xJRU5USURTLkZBQ0VCT09LXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogQVBQQVVUSC5DTElFTlRJRFMuR09PR0xFXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLnR3aXR0ZXIoe1xuXHRcdFx0dXJsOiAnL2F1dGgvdHdpdHRlcidcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ2l0aHViKHtcblx0XHRcdGNsaWVudElkOiBBUFBBVVRILkNMSUVOVElEUy5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblx0LyoqXG5cdCAqIEFuZ3VsYXJKUyAucnVuKCkgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtICRyb290U2NvcGVcblx0ICogQHBhcmFtICRsb2NhdGlvblxuXHQgKiBAcGFyYW0gJGF1dGhcblx0ICovXG5cdGZ1bmN0aW9uIGF1dGhSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHR2YXIgX3BhdGg7XG5cblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0XHRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9IF9wYXRoLmluZGV4T2YoJ2xvZ2luJykgPT09IC0xID8gX3BhdGggOiAnLyc7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZScsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsb2dpbidcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FjY291bnQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FjY291bnQvQWNjb3VudC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50Jyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hZG1pbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWRtaW4vQWRtaW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRcdHJlZGlyZWN0VG86ICcvJ1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZGlyZWN0aXZlKCdkZXRlY3RBZGJsb2NrJywgZGV0ZWN0QWRibG9jayk7XG5cblx0ZGV0ZWN0QWRibG9jay4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrKCR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogZGV0ZWN0QWRibG9ja0xpbmssXG5cdFx0XHR0ZW1wbGF0ZTogICAnPGRpdiBjbGFzcz1cImFkLXRlc3QgZmEtZmFjZWJvb2sgZmEtdHdpdHRlclwiIHN0eWxlPVwiaGVpZ2h0OjFweDtcIj48L2Rpdj4nICtcblx0XHRcdCc8ZGl2IG5nLWlmPVwiYWIuYmxvY2tlZFwiIGNsYXNzPVwiYWItbWVzc2FnZSBhbGVydCBhbGVydC1kYW5nZXJcIj4nICtcblx0XHRcdCc8aSBjbGFzcz1cImZhIGZhLWJhblwiPjwvaT4gPHN0cm9uZz5BZEJsb2NrPC9zdHJvbmc+IGlzIHByb2hpYml0aW5nIGltcG9ydGFudCBmdW5jdGlvbmFsaXR5ISBQbGVhc2UgZGlzYWJsZSBhZCBibG9ja2luZyBvbiA8c3Ryb25nPnt7YWIuaG9zdH19PC9zdHJvbmc+LiBUaGlzIHNpdGUgaXMgYWQtZnJlZS4nICtcblx0XHRcdCc8L2Rpdj4nXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIGRldGVjdEFkYmxvY2sgTElOSyBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbVxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUuYWIgPSB7fTtcblxuXHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0JHNjb3BlLmFiLmhvc3QgPSAkbG9jYXRpb24uaG9zdCgpO1xuXG5cdFx0XHQkdGltZW91dChfYXJlQWRzQmxvY2tlZCwgMjAwKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiBhZHMgYXJlIGJsb2NrZWQgLSBjYWxsZWQgaW4gJHRpbWVvdXQgdG8gbGV0IEFkQmxvY2tlcnMgcnVuXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2FyZUFkc0Jsb2NrZWQoKSB7XG5cdFx0XHRcdHZhciBfYSA9ICRlbGVtLmZpbmQoJy5hZC10ZXN0Jyk7XG5cblx0XHRcdFx0JHNjb3BlLmFiLmJsb2NrZWQgPSBfYS5oZWlnaHQoKSA8PSAwIHx8ICEkZWxlbS5maW5kKCcuYWQtdGVzdDp2aXNpYmxlJykubGVuZ3RoO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59KSgpOyIsIi8vIEZldGNoIGxvY2FsIEpTT04gZGF0YVxuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmZhY3RvcnkoJ2xvY2FsRGF0YScsIGxvY2FsRGF0YSk7XG5cblx0bG9jYWxEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gbG9jYWxEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHRcdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdFx0ICogVXNlZnVsIGZvciBBUElzIChpZSwgd2l0aCBuZ2lueCkgd2hlcmUgc2VydmVyIGVycm9yIEhUTUwgcGFnZSBtYXkgYmUgcmV0dXJuZWQgaW4gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zdWNjZXNzUmVzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3Jcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lcnJvclJlcyhlcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGxvY2FsIEpTT04gZGF0YSBmaWxlIGFuZCByZXR1cm4gcmVzdWx0c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0SlNPTigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvbmctYXBwL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oX3N1Y2Nlc3NSZXMsIF9lcnJvclJlcyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRKU09OOiBnZXRKU09OXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIFVzZXIgZGlyZWN0aXZlXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZGlyZWN0aXZlKCd1c2VyJywgdXNlcik7XG5cblx0ZnVuY3Rpb24gdXNlcigpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0Y29udHJvbGxlcjogdXNlckN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICd1Jyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaWY9XCJ1LmlzQXV0aGVudGljYXRlZCgpICYmICEhdS51c2VyXCIgY2xhc3M9XCJ1c2VyIGNsZWFyZml4XCI+PGltZyBuZy1pZj1cIiEhdS51c2VyLnBpY3R1cmVcIiBuZy1zcmM9XCJ7e3UudXNlci5waWN0dXJlfX1cIiBjbGFzcz1cInVzZXItcGljdHVyZVwiIC8+PHNwYW4gY2xhc3M9XCJ1c2VyLWRpc3BsYXlOYW1lXCI+e3t1LnVzZXIuZGlzcGxheU5hbWV9fTwvc3Bhbj48L2Rpdj4nXG5cdFx0fTtcblx0fVxuXG5cdHVzZXJDdHJsLiRpbmplY3QgPSBbJ3VzZXJEYXRhJywgJyRhdXRoJ107XG5cdC8qKlxuXHQgKiBVc2VyIGRpcmVjdGl2ZSBjb250cm9sbGVyXG5cdCAqL1xuXHRmdW5jdGlvbiB1c2VyQ3RybCh1c2VyRGF0YSwgJGF1dGgpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIHUgPSB0aGlzO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdHUuaXNBdXRoZW50aWNhdGVkID0gX2lzQXV0aGVudGljYXRlZDtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdC8vIEFQSSByZXF1ZXN0IHRvIGdldCB0aGUgdXNlciwgcGFzc2luZyBzdWNjZXNzIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgc2V0cyB0aGUgdXNlcidzIGluZm9cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF91c2VyU3VjY2Vzcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ2hlY2sgaWYgdGhlIGN1cnJlbnQgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pc0F1dGhlbnRpY2F0ZWQoKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bCB1c2VyIHByb21pc2Vcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfdXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0dS51c2VyID0gZGF0YTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5mYWN0b3J5KCd1c2VyRGF0YScsIHVzZXJEYXRhKTtcblxuXHR1c2VyRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRVc2VyOiBnZXRVc2VyLFxuXHRcdFx0dXBkYXRlVXNlcjogdXBkYXRlVXNlcixcblx0XHRcdGdldEFsbFVzZXJzOiBnZXRBbGxVc2Vyc1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zdWNjZXNzUmVzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3Jcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lcnJvclJlcyhlcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKF9zdWNjZXNzUmVzLCBfZXJyb3JSZXMpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSlcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihfc3VjY2Vzc1JlcywgX2Vycm9yUmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgaGVhZGVyQ3RybCk7XHJcblxyXG5cdGhlYWRlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnLCAnJGF1dGgnLCAndXNlckRhdGEnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhLCAkYXV0aCwgdXNlckRhdGEpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBoZWFkZXIgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhlYWRlci5sb2dvdXQgPSBfbG9nb3V0O1xyXG5cdFx0aGVhZGVyLmlzQXV0aGVudGljYXRlZCA9IF9pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IF9pbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gX25hdklzQWN0aXZlO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBnZXQgbG9jYWwgZGF0YVxyXG5cdFx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdFx0Ly8gY2hlY2sgaWYgdXNlciBpcyBhbiBhZG1pblxyXG5cdFx0XHRfY2hlY2tVc2VyQWRtaW4oKTtcclxuXHJcblx0XHRcdC8vIGNoZWNrIGlmIHVzZXIgaXMgYW4gYWRtaW4gb24gbG9jYXRpb24gY2hhbmdlXHJcblx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBfY2hlY2tVc2VyQWRtaW4pO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogU3VjY2Vzc2Z1bGx5IHJldHJpZXZlZCBsb2NhbCBkYXRhXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGFcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aGVhZGVyLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvZ291dCgpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCk7XHJcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIG5vdCBkZWZpbmVkIHlldCwgY2hlY2sgaWYgdGhleSdyZSBhbiBhZG1pblxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLmFkbWluVXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pc0F1dGhlbnRpY2F0ZWQoKSB7XHJcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBuYXZDb250cm9sIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfbGF5b3V0Q2FudmFzID0gXyRib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRcdGRlYm91bmNlOiAxMDBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfbGF5b3V0Q2FudmFzLmNzcyh7XG5cdFx0XHRcdFx0bWluSGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4J1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQoKSB7XG5cdFx0XHRcdGlmIChfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmNvbnRyb2xsZXIoJ0FkbWluQ3RybCcsIEFkbWluQ3RybCk7XG5cblx0QWRtaW5DdHJsLiRpbmplY3QgPSBbJyRhdXRoJywgJ3VzZXJEYXRhJywgJ1VzZXInLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybCgkYXV0aCwgdXNlckRhdGEsIFVzZXIsIFBhZ2UpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcblx0XHRhZG1pbi5pc0F1dGhlbnRpY2F0ZWQgPSBfaXNBdXRoZW50aWNhdGVkO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnQWRtaW4nKTtcblxuXHRcdFx0dXNlckRhdGEuZ2V0QWxsVXNlcnMoKS50aGVuKF9nZXRBbGxVc2Vyc1N1Y2Nlc3MsIF9nZXRBbGxVc2Vyc0Vycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2lzQXV0aGVudGljYXRlZCgpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgQWRtaW4gVUlcblx0XHQgKiBEaXNwbGF5IGxpc3Qgb2YgdXNlcnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFkbWluLnVzZXJzID0gZGF0YTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGFkbWluLnVzZXJzLCBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdHVzZXIubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKHVzZXIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBBY2NvdW50Q3RybCk7XG5cblx0QWNjb3VudEN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRhdXRoJywgJ3VzZXJEYXRhJywgJyR0aW1lb3V0JywgJ09BVVRIJywgJ1VzZXInLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEFjY291bnRDdHJsKCRzY29wZSwgJGF1dGgsIHVzZXJEYXRhLCAkdGltZW91dCwgT0FVVEgsIFVzZXIsIFBhZ2UpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFjY291bnQgPSB0aGlzO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdGFjY291bnQubG9naW5zID0gT0FVVEguTE9HSU5TOyAgLy8gQWxsIGF2YWlsYWJsZSBsb2dpbiBzZXJ2aWNlc1xuXHRcdGFjY291bnQuaXNBdXRoZW50aWNhdGVkID0gX2lzQXV0aGVudGljYXRlZDtcblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBfZ2V0UHJvZmlsZTtcblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSBfdXBkYXRlUHJvZmlsZTtcblx0XHRhY2NvdW50LmxpbmsgPSBfbGluaztcblx0XHRhY2NvdW50LnVubGluayA9IF91bmxpbms7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdBY2NvdW50Jyk7XG5cblx0XHRcdF9idG5TYXZlUmVzZXQoKTtcblxuXHRcdFx0Ly8gd2F0Y2ggZm9yIGRpc3BsYXkgbmFtZSB1cGRhdGVzXG5cdFx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfJHdhdGNoRGlzcGxheU5hbWUpO1xuXG5cdFx0XHQvLyBnZXQgcHJvZmlsZVxuXHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogSXMgdGhlIHVzZXIgYXV0aGVudGljYXRlZD9cblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pc0F1dGhlbnRpY2F0ZWQoKSB7XG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFByb2ZpbGUoKSB7XG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIGVycm9yIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Jcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgcHJvZmlsZSBzYXZlIGJ1dHRvbiB0byBpbml0aWFsIHN0YXRlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9idG5TYXZlUmVzZXQoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gZmFsc2U7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFdhdGNoIGRpc3BsYXkgbmFtZSBjaGFuZ2VzIHRvIGNoZWNrIGZvciBlbXB0eSBvciBudWxsIHN0cmluZ1xuXHRcdCAqIFNldCBidXR0b24gdGV4dCBhY2NvcmRpbmdseVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1ZhbCB7c3RyaW5nfSB1cGRhdGVkIGRpc3BsYXlOYW1lIHZhbHVlIGZyb20gaW5wdXQgZmllbGRcblx0XHQgKiBAcGFyYW0gb2xkVmFsIHsqfSBwcmV2aW91cyBkaXNwbGF5TmFtZSB2YWx1ZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gXyR3YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICogQ2FsbGVkIG9uIHN1Ym1pc3Npb24gb2YgdXBkYXRlIGZvcm1cblx0XHQgKi9cblx0XHQgZnVuY3Rpb24gX3VwZGF0ZVByb2ZpbGUoKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0aWYgKCEhYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lKSB7XG5cdFx0XHRcdC8vIFNldCBzdGF0dXMgdG8gU2F2aW5nLi4uIGFuZCB1cGRhdGUgdXBvbiBzdWNjZXNzIG9yIGVycm9yIGluIGNhbGxiYWNrc1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB1c2VyLCBwYXNzaW5nIHByb2ZpbGUgZGF0YSBhbmQgYXNzaWduaW5nIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrc1xuXHRcdFx0XHR1c2VyRGF0YS51cGRhdGVVc2VyKHByb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3MgY2FsbGJhY2sgd2hlbiBwcm9maWxlIGhhcyBiZWVuIHVwZGF0ZWRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZWQhJztcblxuXHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSAnZXJyb3InO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbGluayhwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oYWNjb3VudC5nZXRQcm9maWxlKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91bmxpbmsocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXHJcblx0XHQuY29udHJvbGxlcignSG9tZUN0cmwnLCBIb21lQ3RybCk7XHJcblxyXG5cdEhvbWVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckYXV0aCcsICdsb2NhbERhdGEnLCAnUGFnZSddO1xyXG5cclxuXHRmdW5jdGlvbiBIb21lQ3RybCgkc2NvcGUsICRhdXRoLCBsb2NhbERhdGEsIFBhZ2UpIHtcclxuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcclxuXHRcdHZhciBob21lID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRob21lLnN0cmluZ09mSFRNTCA9ICc8c3Ryb25nPlNvbWUgYm9sZCB0ZXh0PC9zdHJvbmc+IGJvdW5kIGFzIEhUTUwgd2l0aCBhIDxhIGhyZWY9XCIjXCI+bGluazwvYT4hJztcclxuXHRcdGhvbWUuaXNBdXRoZW50aWNhdGVkID0gX2lzQXV0aGVudGljYXRlZDtcclxuXHRcdGhvbWUudmlld2Zvcm1hdCA9IG51bGw7XHJcblx0XHRob21lLmxvY2FsRGF0YSA9IG51bGw7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0hvbWUnKTtcclxuXHJcblx0XHRcdC8vIGdldCBsb2NhbCBkYXRhXHJcblx0XHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XHJcblxyXG5cdFx0XHQvLyBzZXR1cCBtZWRpYXF1ZXJ5IGZ1bmN0aW9ucyBkZWZpbmluZyBob21lLnZpZXdmb3JtYXRcclxuXHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcclxuXHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pc0F1dGhlbnRpY2F0ZWQoKSB7XHJcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBsb2NhbCBkYXRhIGZyb20gc3RhdGljIEpTT05cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSAoc3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybnMpXHJcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBkYXRhXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5sb2NhbERhdGEgPSBkYXRhO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRW50ZXIgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdzbWFsbCc7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFeGl0IHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XHJcblx0XHRcdGhvbWUudmlld2Zvcm1hdCA9ICdsYXJnZSc7XHJcblx0XHR9XHJcblx0fVxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5cdExvZ2luQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICdPQVVUSCcsICckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIExvZ2luQ3RybCgkYXV0aCwgT0FVVEgsICRyb290U2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhLCBQYWdlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0bG9naW4ubG9naW5zID0gT0FVVEguTE9HSU5TO1xuXHRcdGxvZ2luLmxvZ2dpbmdJbiA9IGZhbHNlO1xuXHRcdGxvZ2luLmF1dGhlbnRpY2F0ZSA9IF9hdXRoZW50aWNhdGU7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXG5cdFx0XHQvLyBnZXQgbG9jYWwgZGF0YVxuXHRcdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBsb2NhbCBkYXRhIHN1Y2Nlc3NmdWxcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtKU09OfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bG9naW4ubG9jYWxEYXRhID0gZGF0YTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBBdXRoZW50aWNhdGUgdGhlIHVzZXIgdmlhIE9hdXRoIHdpdGggdGhlIHNwZWNpZmllZCBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyIC0gKHR3aXR0ZXIsIGZhY2Vib29rLCBnaXRodWIsIGdvb2dsZSlcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYXV0aGVudGljYXRlKHByb3ZpZGVyKSB7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSB0cnVlO1xuXG5cdFx0XHQkYXV0aC5hdXRoZW50aWNhdGUocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKF9hdXRoU3VjY2Vzcylcblx0XHRcdFx0LmNhdGNoKF9hdXRoQ2F0Y2gpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFN1Y2Nlc3NmdWxseSBhdXRoZW50aWNhdGVkXG5cdFx0ICogR28gdG8gaW5pdGlhbGx5IGludGVuZGVkIGF1dGhlbnRpY2F0ZWQgcGF0aFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtvYmplY3R9IHByb21pc2UgcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdGlmICgkcm9vdFNjb3BlLmF1dGhQYXRoKSB7XG5cdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy8nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGYWlsdXJlIGF1dGhlbnRpY2F0aW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRoQ2F0Y2gocmVzcG9uc2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gJ2Vycm9yJztcblx0XHRcdGxvZ2luLmxvZ2luTXNnID0gJydcblx0XHR9XG5cdH1cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9