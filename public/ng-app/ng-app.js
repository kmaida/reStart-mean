angular
	.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'resize', 'satellizer']);
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', '$auth', 'userData', '$timeout', 'OAUTH', 'User', 'Page'];

	function AccountCtrl($scope, $auth, userData, $timeout, OAUTH, User, Page) {
		// controllerAs ViewModel
		var account = this;

		Page.setTitle('Account');

		// All available login services
		account.logins = OAUTH.LOGINS;

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		account.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Get user's profile information
		 */
		account.getProfile = function() {
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

			userData.getUser().then(_getUserSuccess, _getUserError);
		};

		/**
		 * Reset profile save button to initial state
		 *
		 * @private
		 */
		function _btnSaveReset() {
			account.btnSaved = false;
			account.btnSaveText = 'Save';
		}

		_btnSaveReset();

		/**
		 * Watch display name changes to check for empty or null string
		 * Set button text accordingly
		 *
		 * @param newVal {string} updated displayName value from input field
		 * @param oldVal {*} previous displayName value
		 * @private
		 */
		function _watchDisplayName(newVal, oldVal) {
			if (newVal === '' || newVal === null) {
				account.btnSaveText = 'Enter Name';
			} else {
				account.btnSaveText = 'Save';
			}
		}
		$scope.$watch('account.user.displayName', _watchDisplayName);

		/**
		 * Update user's profile information
		 * Called on submission of update form
		 */
		account.updateProfile = function() {
			var profileData = { displayName: account.user.displayName };

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

			if (!!account.user.displayName) {
				// Set status to Saving... and update upon success or error in callbacks
				account.btnSaveText = 'Saving...';

				// Update the user, passing profile data and assigning success and error callbacks
				userData.updateUser(profileData).then(_updateSuccess, _updateError);
			}
		};

		/**
		 * Link third-party provider
		 *
		 * @param {string} provider
		 */
		account.link = function(provider) {
			$auth.link(provider)
				.then(function() {
					account.getProfile();
				})
				.catch(function(response) {
					alert(response.data.message);
				});
		};

		/**
		 * Unlink third-party provider
		 *
		 * @param {string} provider
		 */
		account.unlink = function(provider) {
			$auth.unlink(provider)
				.then(function() {
					account.getProfile();
				})
				.catch(function(response) {
					alert(response.data ? response.data.message : 'Could not unlink ' + provider + ' account');
				});
		};

		account.getProfile();
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['$auth', 'userData', 'User', 'Page'];

	function AdminCtrl($auth, userData, User, Page) {
		// controllerAs ViewModel
		var admin = this;

		Page.setTitle('Admin');

		/**
		 * Determines if the user is authenticated
		 *
		 * @returns {boolean}
		 */
		admin.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

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

		userData.getAllUsers().then(_getAllUsersSuccess, _getAllUsersError);
	}
})();
// media query constants
(function() {
	'use strict';

	angular
		.module('myApp')
		.constant('MQ', {
			SMALL: '(max-width: 767px)',
			LARGE: '(min-width: 768px)'
		});
})();
// login/Oauth constants
(function() {
	'use strict';

	angular
		.module('myApp')
		.constant('OAUTH', {
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
		});
})();
(function() {
	'use strict';

	angular
			.module('myApp')
			.controller('PageCtrl', PageCtrl);

	PageCtrl.$inject = ['Page', '$scope', '$rootScope', 'MQ', 'mediaCheck'];

	function PageCtrl(Page, $scope, $rootScope, MQ, mediaCheck) {
		var page = this;

		// private variables
		var _handlingRouteChangeError = false;

		// associate page <title>
		page.pageTitle = Page;

		/**
		 * Enter mobile media query
		 * $broadcast 'enter-mobile' event
		 *
		 * @private
		 */
		function _enterMobile() {
			$rootScope.$broadcast('enter-mobile');
		}

		/**
		 * Exit mobile media query
		 * $broadcast 'exit-mobile' event
		 *
		 * @private
		 */
		function _exitMobile() {
			$rootScope.$broadcast('exit-mobile');
		}

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

		/**
		 * Match current media query and run appropriate function
		 *
		 * @param $event {event}
		 * @param current {object}
		 * @param previous {object}
		 * @private
		 */
		function _routeChangeSuccess($event, current, previous) {
			mc.matchCurrent(MQ.SMALL);
		}

		$rootScope.$on('$routeChangeSuccess', _routeChangeSuccess);

		/**
		 * Route change error handler
		 * Handle route resolve failures
		 *
		 * @param $event {event}
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

			var destination = (current && (current.title || current.name || current.loadedTemplateUrl)) || 'unknown target';
			var msg = 'Error routing to ' + destination + '. ' + (rejection.msg || '');

			console.log(msg);

			/**
			 * On routing error, show an error.
			 */
			alert('An error occurred. Please try again.');
		}

		$rootScope.$on('$routeChangeError', _routeChangeError);
	}
})();
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
		.factory('User', User);

	User.$inject = ['OAUTH'];

	function User(OAUTH) {

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

		return {
			getLinkedAccounts: getLinkedAccounts
		};
	}
})();
// application $auth constants
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
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
		.module('myApp')
		.config(appConfig);

	appConfig.$inject = ['$routeProvider', '$locationProvider'];

	function appConfig($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: 'ng-app/home/Home.view.html',
				controller: 'HomeCtrl',
				controllerAs: 'home',
				secure: true
			})
			.when('/login', {
				templateUrl: 'ng-app/login/Login.view.html',
				controller: 'LoginCtrl',
				controllerAs: 'login'
			})
			.when('/account', {
				templateUrl: 'ng-app/account/Account.view.html',
				controller: 'AccountCtrl',
				controllerAs: 'account',
				secure: true
			})
			.when('/admin', {
				templateUrl: 'ng-app/admin/Admin.view.html',
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
		.module('myApp')
		.directive('detectAdblock', detectAdblock);

	detectAdblock.$inject = ['$timeout', '$location'];

	function detectAdblock($timeout, $location) {

		function detectAdblockLink($scope, $elem, $attrs) {
			// data object
			$scope.ab = {};

			// hostname for messaging
			$scope.ab.host = $location.host();

			/**
			 * Check if ads are blocked - called in $timeout to let AdBlockers run
			 *
			 * @private
			 */
			function _areAdsBlocked() {
				var _a = $elem.find('.ad-test');

				$scope.ab.blocked = _a.height() <= 0 || !$elem.find('.ad-test:visible').length;
			}

			$timeout(_areAdsBlocked, 200);
		}

		return {
			restrict: 'EA',
			link: detectAdblockLink,
			template:   '<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div>' +
						'<div ng-if="ab.blocked" class="ab-message alert alert-danger">' +
							'<i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.' +
						'</div>'
		}
	}

})();
// Fetch local JSON data
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
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
		.module('myApp')
		.directive('user', user);

	user.$inject = ['userData', '$auth'];

	function user(userData, $auth) {

		/**
		 * User directive controller
		 */
		function userCtrl() {
			// controllerAs ViewModel
			var u = this;

			/**
			 * Check if the current user is authenticated
			 *
			 * @returns {boolean}
			 */
			u.isAuthenticated = function() {
				return $auth.isAuthenticated();
			};

			// API request to get the user, passing success callback function that sets the user's info
			userData.getUser().then(function(data) {
				u.user = data;
			});
		}

		return {
			restrict: 'EA',
			controller: userCtrl,
			controllerAs: 'u',
			template: '<div ng-if="u.isAuthenticated() && !!u.user" class="user clearfix"><img ng-if="!!u.user.picture" ng-src="{{u.user.picture}}" class="user-picture" /><span class="user-displayName">{{u.user.displayName}}</span></div>'
		};
	}
})();
// User API $http calls
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'localData', '$auth', 'userData'];

	function headerCtrl($scope, $location, localData, $auth, userData) {
		// controllerAs ViewModel
		var header = this;

		function _localDataSuccess(data) {
			header.localData = data;
		}

		localData.getJSON().then(_localDataSuccess);

		/**
		 * Log the user out of whatever authentication they've signed in with
		 */
		header.logout = function() {
			header.adminUser = undefined;
			$auth.logout();
			$location.path('/login');
		};

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
		_checkUserAdmin();
		$scope.$on('$locationChangeSuccess', _checkUserAdmin);

		/**
		 * Is the user authenticated?
		 *
		 * @returns {boolean}
		 */
		header.isAuthenticated = function() {
			return $auth.isAuthenticated();
		};

		/**
		 * Currently active nav item when '/' index
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		header.indexIsActive = function(path) {
			// path should be '/'
			return $location.path() === path;
		};

		/**
		 * Currently active nav item
		 *
		 * @param {string} path
		 * @returns {boolean}
		 */
		header.navIsActive = function(path) {
			return $location.path().substr(0, path.length) === path;
		};
	}

})();
(function() {
	'use strict';

	angular
		.module('myApp')
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
		.module('myApp')
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
			// set page title
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
		.module('myApp')
		.controller('LoginCtrl', LoginCtrl);

	LoginCtrl.$inject = ['$auth', 'OAUTH', '$rootScope', '$location', 'localData', 'Page'];

	function LoginCtrl($auth, OAUTH, $rootScope, $location, localData, Page) {
		// controllerAs ViewModel
		var login = this;

		Page.setTitle('Login');

		/**
		 * Function to run when local data successful
		 *
		 * @param data {JSON}
		 * @private
		 */
		function _localDataSuccess(data) {
			login.localData = data;
		}

		localData.getJSON().then(_localDataSuccess);

		login.logins = OAUTH.LOGINS;

		/**
		 * Authenticate the user via Oauth with the specified provider
		 *
		 * @param {string} provider - (twitter, facebook, github, google)
		 */
		login.authenticate = function(provider) {
			login.loggingIn = true;

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

			$auth.authenticate(provider)
				.then(_authSuccess)
				.catch(function(response) {
					console.log(response.data);
					login.loggingIn = 'error';
					login.loginMsg = ''
				});
		}
	}
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLkFVVEguY29uc3RhbnQuanMiLCJjb3JlL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAuY29uZmlnLmpzIiwiY29yZS9kZXRlY3RBZGJsb2NrLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLmZhY3RvcnkuanMiLCJjb3JlL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsImNvcmUvdXNlci5kaXIuanMiLCJjb3JlL3VzZXJEYXRhLmZhY3RvcnkuanMiLCJoZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJoZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJob21lL0hvbWUuY3RybC5qcyIsImxvZ2luL0xvZ2luLmN0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im5nLWFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcblx0Lm1vZHVsZSgnbXlBcHAnLCBbJ25nUm91dGUnLCAnbmdSZXNvdXJjZScsICduZ1Nhbml0aXplJywgJ25nTWVzc2FnZXMnLCAnbWVkaWFDaGVjaycsICdyZXNpemUnLCAnc2F0ZWxsaXplciddKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIEFjY291bnRDdHJsKTtcblxuXHRBY2NvdW50Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGF1dGgnLCAndXNlckRhdGEnLCAnJHRpbWVvdXQnLCAnT0FVVEgnLCAnVXNlcicsICdQYWdlJ107XG5cblx0ZnVuY3Rpb24gQWNjb3VudEN0cmwoJHNjb3BlLCAkYXV0aCwgdXNlckRhdGEsICR0aW1lb3V0LCBPQVVUSCwgVXNlciwgUGFnZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdBY2NvdW50Jyk7XG5cblx0XHQvLyBBbGwgYXZhaWxhYmxlIGxvZ2luIHNlcnZpY2VzXG5cdFx0YWNjb3VudC5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0YWNjb3VudC5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0YWNjb3VudC5nZXRQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdFx0ICogU2hvdyBBY2NvdW50IFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0XHRhY2NvdW50LnVzZXIgPSBkYXRhO1xuXHRcdFx0XHRhY2NvdW50LmFkbWluaXN0cmF0b3IgPSBhY2NvdW50LnVzZXIuaXNBZG1pbjtcblx0XHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0XHRhY2NvdW50LnNob3dBY2NvdW50ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IGFuIGVycm9yIGFsZXJ0IGluIHRoZSBVSVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0XHRhY2NvdW50LmVycm9yR2V0dGluZ1VzZXIgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBSZXNldCBwcm9maWxlIHNhdmUgYnV0dG9uIHRvIGluaXRpYWwgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2J0blNhdmVSZXNldCgpIHtcblx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSBmYWxzZTtcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0fVxuXG5cdFx0X2J0blNhdmVSZXNldCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogV2F0Y2ggZGlzcGxheSBuYW1lIGNoYW5nZXMgdG8gY2hlY2sgZm9yIGVtcHR5IG9yIG51bGwgc3RyaW5nXG5cdFx0ICogU2V0IGJ1dHRvbiB0ZXh0IGFjY29yZGluZ2x5XG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VmFsIHtzdHJpbmd9IHVwZGF0ZWQgZGlzcGxheU5hbWUgdmFsdWUgZnJvbSBpbnB1dCBmaWVsZFxuXHRcdCAqIEBwYXJhbSBvbGRWYWwgeyp9IHByZXZpb3VzIGRpc3BsYXlOYW1lIHZhbHVlXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfd2F0Y2hEaXNwbGF5TmFtZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCA9PT0gJycgfHwgbmV3VmFsID09PSBudWxsKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRW50ZXIgTmFtZSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUuJHdhdGNoKCdhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUnLCBfd2F0Y2hEaXNwbGF5TmFtZSk7XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKiBDYWxsZWQgb24gc3VibWlzc2lvbiBvZiB1cGRhdGUgZm9ybVxuXHRcdCAqL1xuXHRcdGFjY291bnQudXBkYXRlUHJvZmlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogU3VjY2VzcyBjYWxsYmFjayB3aGVuIHByb2ZpbGUgaGFzIGJlZW4gdXBkYXRlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gdHJ1ZTtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlZCEnO1xuXG5cdFx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF91cGRhdGVFcnJvcigpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlZCA9ICdlcnJvcic7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghIWFjY291bnQudXNlci5kaXNwbGF5TmFtZSkge1xuXHRcdFx0XHQvLyBTZXQgc3RhdHVzIHRvIFNhdmluZy4uLiBhbmQgdXBkYXRlIHVwb24gc3VjY2VzcyBvciBlcnJvciBpbiBjYWxsYmFja3Ncblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgdXNlciwgcGFzc2luZyBwcm9maWxlIGRhdGEgYW5kIGFzc2lnbmluZyBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3Ncblx0XHRcdFx0dXNlckRhdGEudXBkYXRlVXNlcihwcm9maWxlRGF0YSkudGhlbihfdXBkYXRlU3VjY2VzcywgX3VwZGF0ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogTGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0YWNjb3VudC5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhLm1lc3NhZ2UpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVW5saW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LnVubGluayA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHQkYXV0aC51bmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRhbGVydChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5tZXNzYWdlIDogJ0NvdWxkIG5vdCB1bmxpbmsgJyArIHByb3ZpZGVyICsgJyBhY2NvdW50Jyk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHRhY2NvdW50LmdldFByb2ZpbGUoKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICd1c2VyRGF0YScsICdVc2VyJywgJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBBZG1pbkN0cmwoJGF1dGgsIHVzZXJEYXRhLCBVc2VyLCBQYWdlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdBZG1pbicpO1xuXG5cdFx0LyoqXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhZG1pbi5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciB1bnN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IFVuYXV0aG9yaXplZCBlcnJvclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtlcnJvcn0gcmVzcG9uc2Vcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9nZXRBbGxVc2Vyc0Vycm9yKGVycm9yKSB7XG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSBmYWxzZTtcblx0XHR9XG5cblx0XHR1c2VyRGF0YS5nZXRBbGxVc2VycygpLnRoZW4oX2dldEFsbFVzZXJzU3VjY2VzcywgX2dldEFsbFVzZXJzRXJyb3IpO1xuXHR9XG59KSgpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uc3RhbnQoJ01RJywge1xuXHRcdFx0U01BTEw6ICcobWF4LXdpZHRoOiA3NjdweCknLFxuXHRcdFx0TEFSR0U6ICcobWluLXdpZHRoOiA3NjhweCknXG5cdFx0fSk7XG59KSgpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uc3RhbnQoJ09BVVRIJywge1xuXHRcdFx0TE9HSU5TOiBbXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0XHRuYW1lOiAnR29vZ2xlJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICd0d2l0dGVyJyxcblx0XHRcdFx0XHRuYW1lOiAnVHdpdHRlcicsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ2ZhY2Vib29rJyxcblx0XHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9mYWNlYm9vay5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0XHRuYW1lOiAnR2l0SHViJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vZ2l0aHViLmNvbSdcblx0XHRcdFx0fVxuXHRcdFx0XVxuXHRcdH0pO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckc2NvcGUnLCAnJHJvb3RTY29wZScsICdNUScsICdtZWRpYUNoZWNrJ107XG5cblx0ZnVuY3Rpb24gUGFnZUN0cmwoUGFnZSwgJHNjb3BlLCAkcm9vdFNjb3BlLCBNUSwgbWVkaWFDaGVjaykge1xuXHRcdHZhciBwYWdlID0gdGhpcztcblxuXHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0dmFyIF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSBmYWxzZTtcblxuXHRcdC8vIGFzc29jaWF0ZSBwYWdlIDx0aXRsZT5cblx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHQvKipcblx0XHQgKiBFbnRlciBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdlbnRlci1tb2JpbGUnIGV2ZW50XG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcblx0XHRcdCRyb290U2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHQkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2V4aXQtbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKiBNYXRjaCBjdXJyZW50IG1lZGlhIHF1ZXJ5IGFuZCBydW4gYXBwcm9wcmlhdGUgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge2V2ZW50fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcblx0XHRcdG1jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cdFx0fVxuXG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCBfcm91dGVDaGFuZ2VTdWNjZXNzKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBlcnJvciBoYW5kbGVyXG5cdFx0ICogSGFuZGxlIHJvdXRlIHJlc29sdmUgZmFpbHVyZXNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkZXZlbnQge2V2ZW50fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHJlamVjdGlvbiB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlRXJyb3IoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cywgcmVqZWN0aW9uKSB7XG5cdFx0XHRpZiAoX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvcikge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdF9oYW5kbGluZ1JvdXRlQ2hhbmdlRXJyb3IgPSB0cnVlO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZUVycm9yJywgX3JvdXRlQ2hhbmdlRXJyb3IpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ1BhZ2UnLCBQYWdlKTtcblxuXHRmdW5jdGlvbiBQYWdlKCkge1xuXHRcdC8vIHByaXZhdGUgdmFyc1xuXHRcdHZhciBzaXRlVGl0bGUgPSAncmVTdGFydC1tZWFuJztcblx0XHR2YXIgcGFnZVRpdGxlID0gJ0hvbWUnO1xuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRUaXRsZTogZ2V0VGl0bGUsXG5cdFx0XHRzZXRUaXRsZTogc2V0VGl0bGVcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogVGl0bGUgZnVuY3Rpb25cblx0XHQgKiBTZXRzIHNpdGUgdGl0bGUgYW5kIHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtzdHJpbmd9IHNpdGUgdGl0bGUgKyBwYWdlIHRpdGxlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0VGl0bGUoKSB7XG5cdFx0XHRyZXR1cm4gc2l0ZVRpdGxlICsgJyB8ICcgKyBwYWdlVGl0bGU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IHBhZ2UgdGl0bGVcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdUaXRsZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHNldFRpdGxlKG5ld1RpdGxlKSB7XG5cdFx0XHRwYWdlVGl0bGUgPSBuZXdUaXRsZTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBmdW5jdGlvbnNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ1VzZXInLCBVc2VyKTtcblxuXHRVc2VyLiRpbmplY3QgPSBbJ09BVVRIJ107XG5cblx0ZnVuY3Rpb24gVXNlcihPQVVUSCkge1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldExpbmtlZEFjY291bnRzOiBnZXRMaW5rZWRBY2NvdW50c1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gYXBwbGljYXRpb24gJGF1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb25zdGFudCgnQVBQQVVUSCcsIHtcblx0XHRcdExPR0lOX1VSTDoge1xuXHRcdFx0XHQvLyBjaGFuZ2UgUFJPRCBkb21haW4gdG8geW91ciBvd25cblx0XHRcdFx0UFJPRDogJ2h0dHA6Ly9yZXN0YXJ0LW1lYW4ua21haWRhLm5ldC9hdXRoL2xvZ2luJyxcblx0XHRcdFx0REVWOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxL2F1dGgvbG9naW4nXG5cdFx0XHR9LFxuXHRcdFx0Q0xJRU5USURTOiB7XG5cdFx0XHRcdC8vIGNoYW5nZSB0aGVzZSBjbGllbnQgSURzIHRvIHlvdXIgb3duXG5cdFx0XHRcdEZBQ0VCT09LOiAnMzQzNzg5MjQ5MTQ2OTY2Jyxcblx0XHRcdFx0R09PR0xFOiAnNDc5NjUxMzY3MzMwLXRydmY4ZWZvbzQxNWllMHVzZmhtNGk1OTQxMHZrM2o5LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcblx0XHRcdFx0R0lUSFVCOiAnODA5NmU5NWMyZWJhMzNiODFhZGInXG5cdFx0XHR9XG5cdFx0fSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbmZpZyhhdXRoQ29uZmlnKVxuXHRcdC5ydW4oYXV0aFJ1bik7XG5cblx0YXV0aENvbmZpZy4kaW5qZWN0ID0gWyckYXV0aFByb3ZpZGVyJywgJ0FQUEFVVEgnXTtcblx0LyoqXG5cdCAqIEFuZ3VsYXJKUyAuY29uZmlnKCkgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtICRhdXRoUHJvdmlkZXIgLSBTYXRlbGxpemVyIHByb3ZpZGVyXG5cdCAqIEBwYXJhbSBBUFBBVVRIIHtvYmplY3R9IGFwcCBhdXRoIGNvbnN0YW50c1xuXHQgKi9cblx0ZnVuY3Rpb24gYXV0aENvbmZpZygkYXV0aFByb3ZpZGVyLCBBUFBBVVRIKSB7XG5cdFx0Ly8gYmVjYXVzZSBwcm92aWRlcnMgKGllLCAkbG9jYXRpb24sICR3aW5kb3cpIGNhbm5vdCBiZSBpbmplY3RlZCBpbiBjb25maWcsXG5cdFx0Ly8gZGV2L3Byb2QgbG9naW4gVVJMcyBtdXN0IGJlIHN3YXBwZWQgbWFudWFsbHlcblxuXHRcdC8vJGF1dGhQcm92aWRlci5sb2dpblVybCA9IEFQUEFVVEguTE9HSU5fVVJMLkRFVjtcblx0XHQkYXV0aFByb3ZpZGVyLmxvZ2luVXJsID0gQVBQQVVUSC5MT0dJTl9VUkwuUFJPRDtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuXHRcdFx0Y2xpZW50SWQ6IEFQUEFVVEguQ0xJRU5USURTLkZBQ0VCT09LXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XG5cdFx0XHRjbGllbnRJZDogQVBQQVVUSC5DTElFTlRJRFMuR09PR0xFXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLnR3aXR0ZXIoe1xuXHRcdFx0dXJsOiAnL2F1dGgvdHdpdHRlcidcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ2l0aHViKHtcblx0XHRcdGNsaWVudElkOiBBUFBBVVRILkNMSUVOVElEUy5HSVRIVUJcblx0XHR9KTtcblx0fVxuXG5cdGF1dGhSdW4uJGluamVjdCA9IFsnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnJGF1dGgnXTtcblx0LyoqXG5cdCAqIEFuZ3VsYXJKUyAucnVuKCkgZnVuY3Rpb25cblx0ICpcblx0ICogQHBhcmFtICRyb290U2NvcGVcblx0ICogQHBhcmFtICRsb2NhdGlvblxuXHQgKiBAcGFyYW0gJGF1dGhcblx0ICovXG5cdGZ1bmN0aW9uIGF1dGhSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHR2YXIgX3BhdGg7XG5cblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0XHRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9IF9wYXRoLmluZGV4T2YoJ2xvZ2luJykgPT09IC0xID8gX3BhdGggOiAnLyc7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbmZpZyhhcHBDb25maWcpO1xuXG5cdGFwcENvbmZpZy4kaW5qZWN0ID0gWyckcm91dGVQcm92aWRlcicsICckbG9jYXRpb25Qcm92aWRlciddO1xuXG5cdGZ1bmN0aW9uIGFwcENvbmZpZygkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcblx0XHQkcm91dGVQcm92aWRlclxuXHRcdFx0LndoZW4oJy8nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2hvbWUvSG9tZS52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnSG9tZUN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdob21lJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9sb2dpbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvbG9naW4vTG9naW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0xvZ2luQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2xvZ2luJ1xuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWNjb3VudCcsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvYWNjb3VudC9BY2NvdW50LnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBY2NvdW50Q3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FjY291bnQnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FkbWluJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9hZG1pbi9BZG1pbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWRtaW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWRtaW4nLFxuXHRcdFx0XHRzZWN1cmU6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQub3RoZXJ3aXNlKHtcblx0XHRcdFx0cmVkaXJlY3RUbzogJy8nXG5cdFx0XHR9KTtcblxuXHRcdCRsb2NhdGlvblByb3ZpZGVyXG5cdFx0XHQuaHRtbDVNb2RlKHtcblx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5oYXNoUHJlZml4KCchJyk7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cblx0XHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrTGluaygkc2NvcGUsICRlbGVtLCAkYXR0cnMpIHtcblx0XHRcdC8vIGRhdGEgb2JqZWN0XG5cdFx0XHQkc2NvcGUuYWIgPSB7fTtcblxuXHRcdFx0Ly8gaG9zdG5hbWUgZm9yIG1lc3NhZ2luZ1xuXHRcdFx0JHNjb3BlLmFiLmhvc3QgPSAkbG9jYXRpb24uaG9zdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENoZWNrIGlmIGFkcyBhcmUgYmxvY2tlZCAtIGNhbGxlZCBpbiAkdGltZW91dCB0byBsZXQgQWRCbG9ja2VycyBydW5cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXJlQWRzQmxvY2tlZCgpIHtcblx0XHRcdFx0dmFyIF9hID0gJGVsZW0uZmluZCgnLmFkLXRlc3QnKTtcblxuXHRcdFx0XHQkc2NvcGUuYWIuYmxvY2tlZCA9IF9hLmhlaWdodCgpIDw9IDAgfHwgISRlbGVtLmZpbmQoJy5hZC10ZXN0OnZpc2libGUnKS5sZW5ndGg7XG5cdFx0XHR9XG5cblx0XHRcdCR0aW1lb3V0KF9hcmVBZHNCbG9ja2VkLCAyMDApO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHRcdCc8aSBjbGFzcz1cImZhIGZhLWJhblwiPjwvaT4gPHN0cm9uZz5BZEJsb2NrPC9zdHJvbmc+IGlzIHByb2hpYml0aW5nIGltcG9ydGFudCBmdW5jdGlvbmFsaXR5ISBQbGVhc2UgZGlzYWJsZSBhZCBibG9ja2luZyBvbiA8c3Ryb25nPnt7YWIuaG9zdH19PC9zdHJvbmc+LiBUaGlzIHNpdGUgaXMgYWQtZnJlZS4nICtcblx0XHRcdFx0XHRcdCc8L2Rpdj4nXG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiLy8gRmV0Y2ggbG9jYWwgSlNPTiBkYXRhXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCdsb2NhbERhdGEnLCBsb2NhbERhdGEpO1xuXG5cdGxvY2FsRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIGxvY2FsRGF0YSgkaHR0cCkge1xuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfc3VjY2Vzc1JlcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXJyb3JSZXMoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBsb2NhbCBKU09OIGRhdGEgZmlsZSBhbmQgcmV0dXJuIHJlc3VsdHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEpTT04oKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL25nLWFwcC9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKF9zdWNjZXNzUmVzLCBfZXJyb3JSZXMpO1xuXHRcdH1cblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0SlNPTjogZ2V0SlNPTlxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIFVzZXIgZGlyZWN0aXZlXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5kaXJlY3RpdmUoJ3VzZXInLCB1c2VyKTtcblxuXHR1c2VyLiRpbmplY3QgPSBbJ3VzZXJEYXRhJywgJyRhdXRoJ107XG5cblx0ZnVuY3Rpb24gdXNlcih1c2VyRGF0YSwgJGF1dGgpIHtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZXIgZGlyZWN0aXZlIGNvbnRyb2xsZXJcblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1c2VyQ3RybCgpIHtcblx0XHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHRcdHZhciB1ID0gdGhpcztcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDaGVjayBpZiB0aGUgY3VycmVudCB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHRcdCAqL1xuXHRcdFx0dS5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdFx0fTtcblxuXHRcdFx0Ly8gQVBJIHJlcXVlc3QgdG8gZ2V0IHRoZSB1c2VyLCBwYXNzaW5nIHN1Y2Nlc3MgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBzZXRzIHRoZSB1c2VyJ3MgaW5mb1xuXHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHR1LnVzZXIgPSBkYXRhO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0Y29udHJvbGxlcjogdXNlckN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICd1Jyxcblx0XHRcdHRlbXBsYXRlOiAnPGRpdiBuZy1pZj1cInUuaXNBdXRoZW50aWNhdGVkKCkgJiYgISF1LnVzZXJcIiBjbGFzcz1cInVzZXIgY2xlYXJmaXhcIj48aW1nIG5nLWlmPVwiISF1LnVzZXIucGljdHVyZVwiIG5nLXNyYz1cInt7dS51c2VyLnBpY3R1cmV9fVwiIGNsYXNzPVwidXNlci1waWN0dXJlXCIgLz48c3BhbiBjbGFzcz1cInVzZXItZGlzcGxheU5hbWVcIj57e3UudXNlci5kaXNwbGF5TmFtZX19PC9zcGFuPjwvZGl2Pidcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIFVzZXIgQVBJICRodHRwIGNhbGxzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5mYWN0b3J5KCd1c2VyRGF0YScsIHVzZXJEYXRhKTtcblxuXHR1c2VyRGF0YS4kaW5qZWN0ID0gWyckaHR0cCddO1xuXG5cdGZ1bmN0aW9uIHVzZXJEYXRhKCRodHRwKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRVc2VyOiBnZXRVc2VyLFxuXHRcdFx0dXBkYXRlVXNlcjogdXBkYXRlVXNlcixcblx0XHRcdGdldEFsbFVzZXJzOiBnZXRBbGxVc2Vyc1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uXG5cdFx0ICogQ2hlY2tzIHR5cGVvZiBkYXRhIHJldHVybmVkIGFuZCBzdWNjZWVkcyBpZiBKUyBvYmplY3QsIHRocm93cyBlcnJvciBpZiBub3Rcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zdWNjZXNzUmVzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3Jcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lcnJvclJlcyhlcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGN1cnJlbnQgdXNlcidzIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS9tZScpXG5cdFx0XHRcdC50aGVuKF9zdWNjZXNzUmVzLCBfZXJyb3JSZXMpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSBjdXJyZW50IHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBwcm9maWxlRGF0YSB7b2JqZWN0fVxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVwZGF0ZVVzZXIocHJvZmlsZURhdGEpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQucHV0KCcvYXBpL21lJywgcHJvZmlsZURhdGEpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEdldCBhbGwgdXNlcnMgKGFkbWluIGF1dGhvcml6ZWQgb25seSlcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtwcm9taXNlfVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldEFsbFVzZXJzKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvdXNlcnMnKVxuXHRcdFx0XHQudGhlbihfc3VjY2Vzc1JlcywgX2Vycm9yUmVzKTtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hlYWRlckN0cmwnLCBoZWFkZXJDdHJsKTtcclxuXHJcblx0aGVhZGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGxvY2F0aW9uJywgJ2xvY2FsRGF0YScsICckYXV0aCcsICd1c2VyRGF0YSddO1xyXG5cclxuXHRmdW5jdGlvbiBoZWFkZXJDdHJsKCRzY29wZSwgJGxvY2F0aW9uLCBsb2NhbERhdGEsICRhdXRoLCB1c2VyRGF0YSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhlYWRlciA9IHRoaXM7XHJcblxyXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRoZWFkZXIubG9jYWxEYXRhID0gZGF0YTtcclxuXHRcdH1cclxuXHJcblx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogTG9nIHRoZSB1c2VyIG91dCBvZiB3aGF0ZXZlciBhdXRoZW50aWNhdGlvbiB0aGV5J3ZlIHNpZ25lZCBpbiB3aXRoXHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCk7XHJcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIGFkbWluVXNlciBpcyB1bmRlZmluZWQsXHJcblx0XHQgKiBnZXQgdGhlIHVzZXIgYW5kIHNldCBhZG1pblVzZXIgYm9vbGVhbi5cclxuXHRcdCAqXHJcblx0XHQgKiBEbyB0aGlzIG9uIGZpcnN0IGNvbnRyb2xsZXIgbG9hZCAoaW5pdCwgcmVmcmVzaClcclxuXHRcdCAqIGFuZCBzdWJzZXF1ZW50IGxvY2F0aW9uIGNoYW5nZXMgKGllLCBjYXRjaGluZyBsb2dvdXQsIGxvZ2luLCBldGMpLlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9jaGVja1VzZXJBZG1pbigpIHtcclxuXHRcdFx0Ly8gaWYgdXNlciBpcyBhdXRoZW50aWNhdGVkIGFuZCBub3QgZGVmaW5lZCB5ZXQsIGNoZWNrIGlmIHRoZXkncmUgYW4gYWRtaW5cclxuXHRcdFx0aWYgKCRhdXRoLmlzQXV0aGVudGljYXRlZCgpICYmIGhlYWRlci5hZG1pblVzZXIgPT09IHVuZGVmaW5lZCkge1xyXG5cdFx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKVxyXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG5cdFx0XHRcdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gZGF0YS5pc0FkbWluO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdF9jaGVja1VzZXJBZG1pbigpO1xyXG5cdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIF9jaGVja1VzZXJBZG1pbik7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJcyB0aGUgdXNlciBhdXRoZW50aWNhdGVkP1xyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdHJldHVybiAkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKTtcclxuXHRcdH07XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBDdXJyZW50bHkgYWN0aXZlIG5hdiBpdGVtIHdoZW4gJy8nIGluZGV4XHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICovXHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0Ly8gcGF0aCBzaG91bGQgYmUgJy8nXHJcblx0XHRcdHJldHVybiAkbG9jYXRpb24ucGF0aCgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5uYXZJc0FjdGl2ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkuc3Vic3RyKDAsIHBhdGgubGVuZ3RoKSA9PT0gcGF0aDtcclxuXHRcdH07XHJcblx0fVxyXG5cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5kaXJlY3RpdmUoJ25hdkNvbnRyb2wnLCBuYXZDb250cm9sKTtcblxuXHRuYXZDb250cm9sLiRpbmplY3QgPSBbJyR3aW5kb3cnLCAncmVzaXplJ107XG5cblx0ZnVuY3Rpb24gbmF2Q29udHJvbCgkd2luZG93LCByZXNpemUpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogbmF2Q29udHJvbExpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbmF2Q29udHJvbCBMSU5LIGZ1bmN0aW9uXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJHNjb3BlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbmF2Q29udHJvbExpbmsoJHNjb3BlKSB7XG5cdFx0XHQvLyBkYXRhIG1vZGVsXG5cdFx0XHQkc2NvcGUubmF2ID0ge307XG5cblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX2xheW91dENhbnZhcyA9IF8kYm9keS5maW5kKCcubGF5b3V0LWNhbnZhcycpO1xuXHRcdFx0dmFyIF9uYXZPcGVuO1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMTAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdCRzY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN0YXJ0JywgXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KTtcblx0XHRcdFx0JHNjb3BlLiRvbignZW50ZXItbW9iaWxlJywgX2VudGVyTW9iaWxlKTtcblx0XHRcdFx0JHNjb3BlLiRvbignZXhpdC1tb2JpbGUnLCBfZXhpdE1vYmlsZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogUmVzaXplZCB3aW5kb3cgKGRlYm91bmNlZClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X2xheW91dENhbnZhcy5jc3Moe1xuXHRcdFx0XHRcdG1pbkhlaWdodDogJHdpbmRvdy5pbm5lckhlaWdodCArICdweCdcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogT3BlbiBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9vcGVuTmF2KCkge1xuXHRcdFx0XHRfJGJvZHlcblx0XHRcdFx0XHQucmVtb3ZlQ2xhc3MoJ25hdi1jbG9zZWQnKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LW9wZW4nKTtcblxuXHRcdFx0XHRfbmF2T3BlbiA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbW9iaWxlIG5hdmlnYXRpb25cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfY2xvc2VOYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LW9wZW4nKVxuXHRcdFx0XHRcdC5hZGRDbGFzcygnbmF2LWNsb3NlZCcpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogVG9nZ2xlIG5hdiBvcGVuL2Nsb3NlZFxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiB0b2dnbGVOYXYoKSB7XG5cdFx0XHRcdGlmICghX25hdk9wZW4pIHtcblx0XHRcdFx0XHRfb3Blbk5hdigpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogV2hlbiBjaGFuZ2luZyBsb2NhdGlvbiwgY2xvc2UgdGhlIG5hdiBpZiBpdCdzIG9wZW5cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyRsb2NhdGlvbkNoYW5nZVN0YXJ0KCkge1xuXHRcdFx0XHRpZiAoX25hdk9wZW4pIHtcblx0XHRcdFx0XHRfY2xvc2VOYXYoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBlbnRlcmluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIENsb3NlIG5hdiBhbmQgc2V0IHVwIG1lbnUgdG9nZ2xpbmcgZnVuY3Rpb25hbGl0eVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZShtcSkge1xuXHRcdFx0XHRfY2xvc2VOYXYoKTtcblxuXHRcdFx0XHQvLyBiaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IHRvZ2dsZU5hdjtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gZXhpdGluZyBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHRcdCAqIERpc2FibGUgbWVudSB0b2dnbGluZyBhbmQgcmVtb3ZlIGJvZHkgY2xhc3Nlc1xuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKG1xKSB7XG5cdFx0XHRcdC8vIHVuYmluZCBmdW5jdGlvbiB0byB0b2dnbGUgbW9iaWxlIG5hdmlnYXRpb24gb3Blbi9jbG9zZWRcblx0XHRcdFx0JHNjb3BlLm5hdi50b2dnbGVOYXYgPSBudWxsO1xuXG5cdFx0XHRcdF8kYm9keS5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCBuYXYtb3BlbicpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuXHQndXNlIHN0cmljdCc7XHJcblxyXG5cdGFuZ3VsYXJcclxuXHRcdC5tb2R1bGUoJ215QXBwJylcclxuXHRcdC5jb250cm9sbGVyKCdIb21lQ3RybCcsIEhvbWVDdHJsKTtcclxuXHJcblx0SG9tZUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRhdXRoJywgJ2xvY2FsRGF0YScsICdQYWdlJ107XHJcblxyXG5cdGZ1bmN0aW9uIEhvbWVDdHJsKCRzY29wZSwgJGF1dGgsIGxvY2FsRGF0YSwgUGFnZSkge1xyXG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxyXG5cdFx0dmFyIGhvbWUgPSB0aGlzO1xyXG5cclxuXHRcdC8vIGJpbmRhYmxlIG1lbWJlcnNcclxuXHRcdGhvbWUuc3RyaW5nT2ZIVE1MID0gJzxzdHJvbmc+U29tZSBib2xkIHRleHQ8L3N0cm9uZz4gYm91bmQgYXMgSFRNTCB3aXRoIGEgPGEgaHJlZj1cIiNcIj5saW5rPC9hPiEnO1xyXG5cdFx0aG9tZS5pc0F1dGhlbnRpY2F0ZWQgPSBfaXNBdXRoZW50aWNhdGVkO1xyXG5cdFx0aG9tZS52aWV3Zm9ybWF0ID0gbnVsbDtcclxuXHRcdGhvbWUubG9jYWxEYXRhID0gbnVsbDtcclxuXHJcblx0XHRfaW5pdCgpO1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcclxuXHRcdFx0Ly8gc2V0IHBhZ2UgdGl0bGVcclxuXHRcdFx0UGFnZS5zZXRUaXRsZSgnSG9tZScpO1xyXG5cclxuXHRcdFx0Ly8gZ2V0IGxvY2FsIGRhdGFcclxuXHRcdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHJcblx0XHRcdC8vIHNldHVwIG1lZGlhcXVlcnkgZnVuY3Rpb25zIGRlZmluaW5nIGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xyXG5cdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIERldGVybWluZXMgaWYgdGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZFxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2lzQXV0aGVudGljYXRlZCgpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogR2V0IGxvY2FsIGRhdGEgZnJvbSBzdGF0aWMgSlNPTlxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhIChzdWNjZXNzZnVsIHByb21pc2UgcmV0dXJucylcclxuXHRcdCAqIEByZXR1cm5zIHtvYmplY3R9IGRhdGFcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xyXG5cdFx0XHRob21lLmxvY2FsRGF0YSA9IGRhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBFbnRlciBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9lbnRlck1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ3NtYWxsJztcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEV4aXQgc21hbGwgbXFcclxuXHRcdCAqIFNldCBob21lLnZpZXdmb3JtYXRcclxuXHRcdCAqXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcclxuXHRcdFx0aG9tZS52aWV3Zm9ybWF0ID0gJ2xhcmdlJztcclxuXHRcdH1cclxuXHR9XHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuXHRMb2dpbkN0cmwuJGluamVjdCA9IFsnJGF1dGgnLCAnT0FVVEgnLCAnJHJvb3RTY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJywgJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBMb2dpbkN0cmwoJGF1dGgsIE9BVVRILCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIGxvY2FsRGF0YSwgUGFnZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbG9naW4gPSB0aGlzO1xuXG5cdFx0UGFnZS5zZXRUaXRsZSgnTG9naW4nKTtcblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIHRvIHJ1biB3aGVuIGxvY2FsIGRhdGEgc3VjY2Vzc2Z1bFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge0pTT059XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRsb2dpbi5sb2NhbERhdGEgPSBkYXRhO1xuXHRcdH1cblxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XG5cblx0XHRsb2dpbi5sb2dpbnMgPSBPQVVUSC5MT0dJTlM7XG5cblx0XHQvKipcblx0XHQgKiBBdXRoZW50aWNhdGUgdGhlIHVzZXIgdmlhIE9hdXRoIHdpdGggdGhlIHNwZWNpZmllZCBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyIC0gKHR3aXR0ZXIsIGZhY2Vib29rLCBnaXRodWIsIGdvb2dsZSlcblx0XHQgKi9cblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0bG9naW4ubG9nZ2luZ0luID0gdHJ1ZTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzZnVsbHkgYXV0aGVudGljYXRlZFxuXHRcdFx0ICogR28gdG8gaW5pdGlhbGx5IGludGVuZGVkIGF1dGhlbnRpY2F0ZWQgcGF0aFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwYXJhbSByZXNwb25zZSB7b2JqZWN0fSBwcm9taXNlIHJlc3BvbnNlXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfYXV0aFN1Y2Nlc3MocmVzcG9uc2UpIHtcblx0XHRcdFx0bG9naW4ubG9nZ2luZ0luID0gZmFsc2U7XG5cblx0XHRcdFx0aWYgKCRyb290U2NvcGUuYXV0aFBhdGgpIHtcblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgkcm9vdFNjb3BlLmF1dGhQYXRoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnLycpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCRhdXRoLmF1dGhlbnRpY2F0ZShwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oX2F1dGhTdWNjZXNzKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcblx0XHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSAnZXJyb3InO1xuXHRcdFx0XHRcdGxvZ2luLmxvZ2luTXNnID0gJydcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59KSgpOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==