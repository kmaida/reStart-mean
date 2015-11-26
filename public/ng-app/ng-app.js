(function() {
	'use strict';

	angular
		.module('myApp', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'resize', 'satellizer']);
})();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJhY2NvdW50L0FjY291bnQuY3RybC5qcyIsImFkbWluL0FkbWluLmN0cmwuanMiLCJjb3JlL01RLmNvbnN0YW50LmpzIiwiY29yZS9PQVVUSC5jb25zdGFudC5qcyIsImNvcmUvUGFnZS5jdHJsLmpzIiwiY29yZS9QYWdlLmZhY3RvcnkuanMiLCJjb3JlL1VzZXIuZmFjdG9yeS5qcyIsImNvcmUvYXBwLkFVVEguY29uc3RhbnQuanMiLCJjb3JlL2FwcC5hdXRoLmpzIiwiY29yZS9hcHAuY29uZmlnLmpzIiwiY29yZS9kZXRlY3RBZGJsb2NrLmRpci5qcyIsImNvcmUvbG9jYWxEYXRhLmZhY3RvcnkuanMiLCJjb3JlL3RydXN0QXNIVE1MLmZpbHRlci5qcyIsImNvcmUvdXNlci5kaXIuanMiLCJjb3JlL3VzZXJEYXRhLmZhY3RvcnkuanMiLCJoZWFkZXIvSGVhZGVyLmN0cmwuanMiLCJoZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJob21lL0hvbWUuY3RybC5qcyIsImxvZ2luL0xvZ2luLmN0cmwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibmctYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInXSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckYXV0aCcsICd1c2VyRGF0YScsICckdGltZW91dCcsICdPQVVUSCcsICdVc2VyJywgJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBBY2NvdW50Q3RybCgkc2NvcGUsICRhdXRoLCB1c2VyRGF0YSwgJHRpbWVvdXQsIE9BVVRILCBVc2VyLCBQYWdlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhY2NvdW50ID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FjY291bnQnKTtcblxuXHRcdC8vIEFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHRhY2NvdW50LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBHZXQgdXNlcidzIHByb2ZpbGUgaW5mb3JtYXRpb25cblx0XHQgKi9cblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0XHQgKiBTaG93IEFjY291bnQgVUlcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0gZGF0YSB7b2JqZWN0fSBwcm9taXNlIHByb3ZpZGVkIGJ5ICRodHRwIHN1Y2Nlc3Ncblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRcdGFjY291bnQudXNlciA9IGRhdGE7XG5cdFx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0XHRhY2NvdW50LmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyhhY2NvdW50LnVzZXIsICdhY2NvdW50Jyk7XG5cdFx0XHRcdGFjY291bnQuc2hvd0FjY291bnQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIGZvciBlcnJvciBBUEkgY2FsbCBnZXR0aW5nIHVzZXIncyBwcm9maWxlIGRhdGFcblx0XHRcdCAqIFNob3cgYW4gZXJyb3IgYWxlcnQgaW4gdGhlIFVJXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIGVycm9yXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfZ2V0VXNlckVycm9yKGVycm9yKSB7XG5cdFx0XHRcdGFjY291bnQuZXJyb3JHZXR0aW5nVXNlciA9IHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHVzZXJEYXRhLmdldFVzZXIoKS50aGVuKF9nZXRVc2VyU3VjY2VzcywgX2dldFVzZXJFcnJvcik7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHByb2ZpbGUgc2F2ZSBidXR0b24gdG8gaW5pdGlhbCBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYnRuU2F2ZVJlc2V0KCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IGZhbHNlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHR9XG5cblx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cblx0XHQvKipcblx0XHQgKiBXYXRjaCBkaXNwbGF5IG5hbWUgY2hhbmdlcyB0byBjaGVjayBmb3IgZW1wdHkgb3IgbnVsbCBzdHJpbmdcblx0XHQgKiBTZXQgYnV0dG9uIHRleHQgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdXBkYXRlZCBkaXNwbGF5TmFtZSB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkXG5cdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn0gcHJldmlvdXMgZGlzcGxheU5hbWUgdmFsdWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF93YXRjaERpc3BsYXlOYW1lKG5ld1ZhbCwgb2xkVmFsKSB7XG5cdFx0XHRpZiAobmV3VmFsID09PSAnJyB8fCBuZXdWYWwgPT09IG51bGwpIHtcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFbnRlciBOYW1lJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnU2F2ZSc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS4kd2F0Y2goJ2FjY291bnQudXNlci5kaXNwbGF5TmFtZScsIF93YXRjaERpc3BsYXlOYW1lKTtcblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqIENhbGxlZCBvbiBzdWJtaXNzaW9uIG9mIHVwZGF0ZSBmb3JtXG5cdFx0ICovXG5cdFx0YWNjb3VudC51cGRhdGVQcm9maWxlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgcHJvZmlsZURhdGEgPSB7IGRpc3BsYXlOYW1lOiBhY2NvdW50LnVzZXIuZGlzcGxheU5hbWUgfTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZVN1Y2Nlc3MoKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZWQgPSB0cnVlO1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdFx0JHRpbWVvdXQoX2J0blNhdmVSZXNldCwgMjUwMCk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRXJyb3IgY2FsbGJhY2sgd2hlbiBwcm9maWxlIHVwZGF0ZSBoYXMgZmFpbGVkXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX3VwZGF0ZUVycm9yKCkge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdFcnJvciBzYXZpbmchJztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCEhYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lKSB7XG5cdFx0XHRcdC8vIFNldCBzdGF0dXMgdG8gU2F2aW5nLi4uIGFuZCB1cGRhdGUgdXBvbiBzdWNjZXNzIG9yIGVycm9yIGluIGNhbGxiYWNrc1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmluZy4uLic7XG5cblx0XHRcdFx0Ly8gVXBkYXRlIHRoZSB1c2VyLCBwYXNzaW5nIHByb2ZpbGUgZGF0YSBhbmQgYXNzaWduaW5nIHN1Y2Nlc3MgYW5kIGVycm9yIGNhbGxiYWNrc1xuXHRcdFx0XHR1c2VyRGF0YS51cGRhdGVVc2VyKHByb2ZpbGVEYXRhKS50aGVuKF91cGRhdGVTdWNjZXNzLCBfdXBkYXRlRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHRoaXJkLXBhcnR5IHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXJcblx0XHQgKi9cblx0XHRhY2NvdW50LmxpbmsgPSBmdW5jdGlvbihwcm92aWRlcikge1xuXHRcdFx0JGF1dGgubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEubWVzc2FnZSk7XG5cdFx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGFjY291bnQudW5saW5rID0gZnVuY3Rpb24ocHJvdmlkZXIpIHtcblx0XHRcdCRhdXRoLnVubGluayhwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0YWNjb3VudC5nZXRQcm9maWxlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGFsZXJ0KHJlc3BvbnNlLmRhdGEgPyByZXNwb25zZS5kYXRhLm1lc3NhZ2UgOiAnQ291bGQgbm90IHVubGluayAnICsgcHJvdmlkZXIgKyAnIGFjY291bnQnKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGFjY291bnQuZ2V0UHJvZmlsZSgpO1xuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbnRyb2xsZXIoJ0FkbWluQ3RybCcsIEFkbWluQ3RybCk7XG5cblx0QWRtaW5DdHJsLiRpbmplY3QgPSBbJyRhdXRoJywgJ3VzZXJEYXRhJywgJ1VzZXInLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIEFkbWluQ3RybCgkYXV0aCwgdXNlckRhdGEsIFVzZXIsIFBhZ2UpIHtcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXG5cdFx0dmFyIGFkbWluID0gdGhpcztcblxuXHRcdFBhZ2Uuc2V0VGl0bGUoJ0FkbWluJyk7XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWRcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdGFkbWluLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3Igc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgQWRtaW4gVUlcblx0XHQgKiBEaXNwbGF5IGxpc3Qgb2YgdXNlcnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtBcnJheX0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0QWxsVXNlcnNTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGFkbWluLnVzZXJzID0gZGF0YTtcblxuXHRcdFx0YW5ndWxhci5mb3JFYWNoKGFkbWluLnVzZXJzLCBmdW5jdGlvbih1c2VyKSB7XG5cdFx0XHRcdHVzZXIubGlua2VkQWNjb3VudHMgPSBVc2VyLmdldExpbmtlZEFjY291bnRzKHVzZXIpO1xuXHRcdFx0fSk7XG5cblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IHRydWU7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXHRcdH1cblxuXHRcdHVzZXJEYXRhLmdldEFsbFVzZXJzKCkudGhlbihfZ2V0QWxsVXNlcnNTdWNjZXNzLCBfZ2V0QWxsVXNlcnNFcnJvcik7XG5cdH1cbn0pKCk7IiwiLy8gbWVkaWEgcXVlcnkgY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb25zdGFudCgnTVEnLCB7XG5cdFx0XHRTTUFMTDogJyhtYXgtd2lkdGg6IDc2N3B4KScsXG5cdFx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0XHR9KTtcbn0pKCk7IiwiLy8gbG9naW4vT2F1dGggY29uc3RhbnRzXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb25zdGFudCgnT0FVVEgnLCB7XG5cdFx0XHRMT0dJTlM6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnb29nbGUnLFxuXHRcdFx0XHRcdG5hbWU6ICdHb29nbGUnLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0YWNjb3VudDogJ3R3aXR0ZXInLFxuXHRcdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0XHR1cmw6ICdodHRwOi8vdHdpdHRlci5jb20nXG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRcdG5hbWU6ICdGYWNlYm9vaycsXG5cdFx0XHRcdFx0dXJsOiAnaHR0cDovL2ZhY2Vib29rLmNvbSdcblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdGFjY291bnQ6ICdnaXRodWInLFxuXHRcdFx0XHRcdG5hbWU6ICdHaXRIdWInLFxuXHRcdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fSk7XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHRcdC5jb250cm9sbGVyKCdQYWdlQ3RybCcsIFBhZ2VDdHJsKTtcblxuXHRQYWdlQ3RybC4kaW5qZWN0ID0gWydQYWdlJywgJyRzY29wZScsICckcm9vdFNjb3BlJywgJ01RJywgJ21lZGlhQ2hlY2snXTtcblxuXHRmdW5jdGlvbiBQYWdlQ3RybChQYWdlLCAkc2NvcGUsICRyb290U2NvcGUsIE1RLCBtZWRpYUNoZWNrKSB7XG5cdFx0dmFyIHBhZ2UgPSB0aGlzO1xuXG5cdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHR2YXIgX2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IGZhbHNlO1xuXG5cdFx0Ly8gYXNzb2NpYXRlIHBhZ2UgPHRpdGxlPlxuXHRcdHBhZ2UucGFnZVRpdGxlID0gUGFnZTtcblxuXHRcdC8qKlxuXHRcdCAqIEVudGVyIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2VudGVyLW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xuXHRcdFx0JHJvb3RTY29wZS4kYnJvYWRjYXN0KCdlbnRlci1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBFeGl0IG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdCAqICRicm9hZGNhc3QgJ2V4aXQtbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZXhpdE1vYmlsZSgpIHtcblx0XHRcdCRyb290U2NvcGUuJGJyb2FkY2FzdCgnZXhpdC1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvLyBTZXQgdXAgZnVuY3Rpb25hbGl0eSB0byBydW4gb24gZW50ZXIvZXhpdCBvZiBtZWRpYSBxdWVyeVxuXHRcdHZhciBtYyA9IG1lZGlhQ2hlY2suaW5pdCh7XG5cdFx0XHRzY29wZTogJHNjb3BlLFxuXHRcdFx0bWVkaWE6IHtcblx0XHRcdFx0bXE6IE1RLlNNQUxMLFxuXHRcdFx0XHRlbnRlcjogX2VudGVyTW9iaWxlLFxuXHRcdFx0XHRleGl0OiBfZXhpdE1vYmlsZVxuXHRcdFx0fSxcblx0XHRcdGRlYm91bmNlOiAyMDBcblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqIE1hdGNoIGN1cnJlbnQgbWVkaWEgcXVlcnkgYW5kIHJ1biBhcHByb3ByaWF0ZSBmdW5jdGlvblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7ZXZlbnR9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MoJGV2ZW50LCBjdXJyZW50LCBwcmV2aW91cykge1xuXHRcdFx0bWMubWF0Y2hDdXJyZW50KE1RLlNNQUxMKTtcblx0XHR9XG5cblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MpO1xuXG5cdFx0LyoqXG5cdFx0ICogUm91dGUgY2hhbmdlIGVycm9yIGhhbmRsZXJcblx0XHQgKiBIYW5kbGUgcm91dGUgcmVzb2x2ZSBmYWlsdXJlc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7ZXZlbnR9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cblx0XHRcdHZhciBkZXN0aW5hdGlvbiA9IChjdXJyZW50ICYmIChjdXJyZW50LnRpdGxlIHx8IGN1cnJlbnQubmFtZSB8fCBjdXJyZW50LmxvYWRlZFRlbXBsYXRlVXJsKSkgfHwgJ3Vua25vd24gdGFyZ2V0Jztcblx0XHRcdHZhciBtc2cgPSAnRXJyb3Igcm91dGluZyB0byAnICsgZGVzdGluYXRpb24gKyAnLiAnICsgKHJlamVjdGlvbi5tc2cgfHwgJycpO1xuXG5cdFx0XHRjb25zb2xlLmxvZyhtc2cpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9uIHJvdXRpbmcgZXJyb3IsIHNob3cgYW4gZXJyb3IuXG5cdFx0XHQgKi9cblx0XHRcdGFsZXJ0KCdBbiBlcnJvciBvY2N1cnJlZC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcblx0XHR9XG5cblx0XHQkcm9vdFNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZmFjdG9yeSgnUGFnZScsIFBhZ2UpO1xuXG5cdGZ1bmN0aW9uIFBhZ2UoKSB7XG5cdFx0Ly8gcHJpdmF0ZSB2YXJzXG5cdFx0dmFyIHNpdGVUaXRsZSA9ICdyZVN0YXJ0LW1lYW4nO1xuXHRcdHZhciBwYWdlVGl0bGUgPSAnSG9tZSc7XG5cblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFRpdGxlOiBnZXRUaXRsZSxcblx0XHRcdHNldFRpdGxlOiBzZXRUaXRsZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBUaXRsZSBmdW5jdGlvblxuXHRcdCAqIFNldHMgc2l0ZSB0aXRsZSBhbmQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3N0cmluZ30gc2l0ZSB0aXRsZSArIHBhZ2UgdGl0bGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRUaXRsZSgpIHtcblx0XHRcdHJldHVybiBzaXRlVGl0bGUgKyAnIHwgJyArIHBhZ2VUaXRsZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTZXQgcGFnZSB0aXRsZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG5ld1RpdGxlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc2V0VGl0bGUobmV3VGl0bGUpIHtcblx0XHRcdHBhZ2VUaXRsZSA9IG5ld1RpdGxlO1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBVc2VyIGZ1bmN0aW9uc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG5cdFVzZXIuJGluamVjdCA9IFsnT0FVVEgnXTtcblxuXHRmdW5jdGlvbiBVc2VyKE9BVVRIKSB7XG5cblx0XHQvKipcblx0XHQgKiBDcmVhdGUgYXJyYXkgb2YgYSB1c2VyJ3MgY3VycmVudGx5LWxpbmtlZCBhY2NvdW50IGxvZ2luc1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHVzZXJPYmpcblx0XHQgKiBAcmV0dXJucyB7QXJyYXl9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0TGlua2VkQWNjb3VudHModXNlck9iaikge1xuXHRcdFx0dmFyIGxpbmtlZEFjY291bnRzID0gW107XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChPQVVUSC5MT0dJTlMsIGZ1bmN0aW9uKGFjdE9iaikge1xuXHRcdFx0XHR2YXIgYWN0ID0gYWN0T2JqLmFjY291bnQ7XG5cblx0XHRcdFx0aWYgKHVzZXJPYmpbYWN0XSkge1xuXHRcdFx0XHRcdGxpbmtlZEFjY291bnRzLnB1c2goYWN0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBsaW5rZWRBY2NvdW50cztcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0TGlua2VkQWNjb3VudHM6IGdldExpbmtlZEFjY291bnRzXG5cdFx0fTtcblx0fVxufSkoKTsiLCIvLyBhcHBsaWNhdGlvbiAkYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmNvbnN0YW50KCdBUFBBVVRIJywge1xuXHRcdFx0TE9HSU5fVVJMOiB7XG5cdFx0XHRcdC8vIGNoYW5nZSBQUk9EIGRvbWFpbiB0byB5b3VyIG93blxuXHRcdFx0XHRQUk9EOiAnaHR0cDovL3Jlc3RhcnQtbWVhbi5rbWFpZGEubmV0L2F1dGgvbG9naW4nLFxuXHRcdFx0XHRERVY6ICdodHRwOi8vbG9jYWxob3N0OjgwODEvYXV0aC9sb2dpbidcblx0XHRcdH0sXG5cdFx0XHRDTElFTlRJRFM6IHtcblx0XHRcdFx0Ly8gY2hhbmdlIHRoZXNlIGNsaWVudCBJRHMgdG8geW91ciBvd25cblx0XHRcdFx0RkFDRUJPT0s6ICczNDM3ODkyNDkxNDY5NjYnLFxuXHRcdFx0XHRHT09HTEU6ICc0Nzk2NTEzNjczMzAtdHJ2ZjhlZm9vNDE1aWUwdXNmaG00aTU5NDEwdmszajkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxuXHRcdFx0XHRHSVRIVUI6ICc4MDk2ZTk1YzJlYmEzM2I4MWFkYidcblx0XHRcdH1cblx0XHR9KTtcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uZmlnKGF1dGhDb25maWcpXG5cdFx0LnJ1bihhdXRoUnVuKTtcblxuXHRhdXRoQ29uZmlnLiRpbmplY3QgPSBbJyRhdXRoUHJvdmlkZXInLCAnQVBQQVVUSCddO1xuXHQvKipcblx0ICogQW5ndWxhckpTIC5jb25maWcoKSBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gJGF1dGhQcm92aWRlciAtIFNhdGVsbGl6ZXIgcHJvdmlkZXJcblx0ICogQHBhcmFtIEFQUEFVVEgge29iamVjdH0gYXBwIGF1dGggY29uc3RhbnRzXG5cdCAqL1xuXHRmdW5jdGlvbiBhdXRoQ29uZmlnKCRhdXRoUHJvdmlkZXIsIEFQUEFVVEgpIHtcblx0XHQvLyBiZWNhdXNlIHByb3ZpZGVycyAoaWUsICRsb2NhdGlvbiwgJHdpbmRvdykgY2Fubm90IGJlIGluamVjdGVkIGluIGNvbmZpZyxcblx0XHQvLyBkZXYvcHJvZCBsb2dpbiBVUkxzIG11c3QgYmUgc3dhcHBlZCBtYW51YWxseVxuXG5cdFx0Ly8kYXV0aFByb3ZpZGVyLmxvZ2luVXJsID0gQVBQQVVUSC5MT0dJTl9VUkwuREVWO1xuXHRcdCRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBBUFBBVVRILkxPR0lOX1VSTC5QUk9EO1xuXG5cdFx0JGF1dGhQcm92aWRlci5mYWNlYm9vayh7XG5cdFx0XHRjbGllbnRJZDogQVBQQVVUSC5DTElFTlRJRFMuRkFDRUJPT0tcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIuZ29vZ2xlKHtcblx0XHRcdGNsaWVudElkOiBBUFBBVVRILkNMSUVOVElEUy5HT09HTEVcblx0XHR9KTtcblxuXHRcdCRhdXRoUHJvdmlkZXIudHdpdHRlcih7XG5cdFx0XHR1cmw6ICcvYXV0aC90d2l0dGVyJ1xuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5naXRodWIoe1xuXHRcdFx0Y2xpZW50SWQ6IEFQUEFVVEguQ0xJRU5USURTLkdJVEhVQlxuXHRcdH0pO1xuXHR9XG5cblx0YXV0aFJ1bi4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICckYXV0aCddO1xuXHQvKipcblx0ICogQW5ndWxhckpTIC5ydW4oKSBmdW5jdGlvblxuXHQgKlxuXHQgKiBAcGFyYW0gJHJvb3RTY29wZVxuXHQgKiBAcGFyYW0gJGxvY2F0aW9uXG5cdCAqIEBwYXJhbSAkYXV0aFxuXHQgKi9cblx0ZnVuY3Rpb24gYXV0aFJ1bigkcm9vdFNjb3BlLCAkbG9jYXRpb24sICRhdXRoKSB7XG5cdFx0JHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIG5leHQsIGN1cnJlbnQpIHtcblx0XHRcdHZhciBfcGF0aDtcblxuXHRcdFx0aWYgKG5leHQgJiYgbmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5zZWN1cmUgJiYgISRhdXRoLmlzQXV0aGVudGljYXRlZCgpKSB7XG5cdFx0XHRcdF9wYXRoID0gJGxvY2F0aW9uLnBhdGgoKTtcblxuXHRcdFx0XHQkcm9vdFNjb3BlLmF1dGhQYXRoID0gX3BhdGguaW5kZXhPZignbG9naW4nKSA9PT0gLTEgPyBfcGF0aCA6ICcvJztcblxuXHRcdFx0XHQkcm9vdFNjb3BlLiRldmFsQXN5bmMoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0Ly8gc2VuZCB1c2VyIHRvIGxvZ2luXG5cdFx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG59KSgpOyIsIi8vIHJvdXRlc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuY29uZmlnKGFwcENvbmZpZyk7XG5cblx0YXBwQ29uZmlnLiRpbmplY3QgPSBbJyRyb3V0ZVByb3ZpZGVyJywgJyRsb2NhdGlvblByb3ZpZGVyJ107XG5cblx0ZnVuY3Rpb24gYXBwQ29uZmlnKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuXHRcdCRyb3V0ZVByb3ZpZGVyXG5cdFx0XHQud2hlbignLycsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvaG9tZS9Ib21lLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdIb21lQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2hvbWUnLFxuXHRcdFx0XHRzZWN1cmU6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2xvZ2luJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9sb2dpbi9Mb2dpbi52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnTG9naW5DdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnbG9naW4nXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hY2NvdW50Jywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9hY2NvdW50L0FjY291bnQudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FjY291bnRDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnYWNjb3VudCcsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvYWRtaW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL2FkbWluL0FkbWluLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdBZG1pbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhZG1pbicsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC5vdGhlcndpc2Uoe1xuXHRcdFx0XHRyZWRpcmVjdFRvOiAnLydcblx0XHRcdH0pO1xuXG5cdFx0JGxvY2F0aW9uUHJvdmlkZXJcblx0XHRcdC5odG1sNU1vZGUoe1xuXHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lmhhc2hQcmVmaXgoJyEnKTtcblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ215QXBwJylcblx0XHQuZGlyZWN0aXZlKCdkZXRlY3RBZGJsb2NrJywgZGV0ZWN0QWRibG9jayk7XG5cblx0ZGV0ZWN0QWRibG9jay4kaW5qZWN0ID0gWyckdGltZW91dCcsICckbG9jYXRpb24nXTtcblxuXHRmdW5jdGlvbiBkZXRlY3RBZGJsb2NrKCR0aW1lb3V0LCAkbG9jYXRpb24pIHtcblxuXHRcdGZ1bmN0aW9uIGRldGVjdEFkYmxvY2tMaW5rKCRzY29wZSwgJGVsZW0sICRhdHRycykge1xuXHRcdFx0Ly8gZGF0YSBvYmplY3Rcblx0XHRcdCRzY29wZS5hYiA9IHt9O1xuXG5cdFx0XHQvLyBob3N0bmFtZSBmb3IgbWVzc2FnaW5nXG5cdFx0XHQkc2NvcGUuYWIuaG9zdCA9ICRsb2NhdGlvbi5ob3N0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblxuXHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0bGluazogZGV0ZWN0QWRibG9ja0xpbmssXG5cdFx0XHR0ZW1wbGF0ZTogICAnPGRpdiBjbGFzcz1cImFkLXRlc3QgZmEtZmFjZWJvb2sgZmEtdHdpdHRlclwiIHN0eWxlPVwiaGVpZ2h0OjFweDtcIj48L2Rpdj4nICtcblx0XHRcdFx0XHRcdCc8ZGl2IG5nLWlmPVwiYWIuYmxvY2tlZFwiIGNsYXNzPVwiYWItbWVzc2FnZSBhbGVydCBhbGVydC1kYW5nZXJcIj4nICtcblx0XHRcdFx0XHRcdFx0JzxpIGNsYXNzPVwiZmEgZmEtYmFuXCI+PC9pPiA8c3Ryb25nPkFkQmxvY2s8L3N0cm9uZz4gaXMgcHJvaGliaXRpbmcgaW1wb3J0YW50IGZ1bmN0aW9uYWxpdHkhIFBsZWFzZSBkaXNhYmxlIGFkIGJsb2NraW5nIG9uIDxzdHJvbmc+e3thYi5ob3N0fX08L3N0cm9uZz4uIFRoaXMgc2l0ZSBpcyBhZC1mcmVlLicgK1xuXHRcdFx0XHRcdFx0JzwvZGl2Pidcblx0XHR9XG5cdH1cblxufSkoKTsiLCIvLyBGZXRjaCBsb2NhbCBKU09OIGRhdGFcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ2xvY2FsRGF0YScsIGxvY2FsRGF0YSk7XG5cblx0bG9jYWxEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gbG9jYWxEYXRhKCRodHRwKSB7XG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvblxuXHRcdCAqIENoZWNrcyB0eXBlb2YgZGF0YSByZXR1cm5lZCBhbmQgc3VjY2VlZHMgaWYgSlMgb2JqZWN0LCB0aHJvd3MgZXJyb3IgaWYgbm90XG5cdFx0ICogVXNlZnVsIGZvciBBUElzIChpZSwgd2l0aCBuZ2lueCkgd2hlcmUgc2VydmVyIGVycm9yIEhUTUwgcGFnZSBtYXkgYmUgcmV0dXJuZWQgaW4gZXJyb3Jcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7Kn0gZGF0YSBmcm9tICRodHRwXG5cdFx0ICogQHJldHVybnMgeyp9IG9iamVjdCwgYXJyYXlcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9zdWNjZXNzUmVzKHJlc3BvbnNlKSB7XG5cdFx0XHRpZiAodHlwZW9mIHJlc3BvbnNlLmRhdGEgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdyZXRyaWV2ZWQgZGF0YSBpcyBub3QgdHlwZW9mIG9iamVjdC4nKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBQcm9taXNlIHJlc3BvbnNlIGZ1bmN0aW9uIC0gZXJyb3Jcblx0XHQgKiBUaHJvd3MgYW4gZXJyb3Igd2l0aCBlcnJvciBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9lcnJvclJlcyhlcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciByZXRyaWV2aW5nIGRhdGEnLCBlcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGxvY2FsIEpTT04gZGF0YSBmaWxlIGFuZCByZXR1cm4gcmVzdWx0c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0SlNPTigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvbmctYXBwL2RhdGEvZGF0YS5qc29uJylcblx0XHRcdFx0LnRoZW4oX3N1Y2Nlc3NSZXMsIF9lcnJvclJlcyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRKU09OOiBnZXRKU09OXG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZpbHRlcigndHJ1c3RBc0hUTUwnLCB0cnVzdEFzSFRNTCk7XG5cblx0dHJ1c3RBc0hUTUwuJGluamVjdCA9IFsnJHNjZSddO1xuXG5cdGZ1bmN0aW9uIHRydXN0QXNIVE1MKCRzY2UpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHRleHQpIHtcblx0XHRcdHJldHVybiAkc2NlLnRydXN0QXNIdG1sKHRleHQpO1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBkaXJlY3RpdmVcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmRpcmVjdGl2ZSgndXNlcicsIHVzZXIpO1xuXG5cdHVzZXIuJGluamVjdCA9IFsndXNlckRhdGEnLCAnJGF1dGgnXTtcblxuXHRmdW5jdGlvbiB1c2VyKHVzZXJEYXRhLCAkYXV0aCkge1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlciBkaXJlY3RpdmUgY29udHJvbGxlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIHVzZXJDdHJsKCkge1xuXHRcdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdFx0dmFyIHUgPSB0aGlzO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIENoZWNrIGlmIHRoZSBjdXJyZW50IHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdFx0ICpcblx0XHRcdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHRcdFx0ICovXG5cdFx0XHR1LmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XG5cdFx0XHR9O1xuXG5cdFx0XHQvLyBBUEkgcmVxdWVzdCB0byBnZXQgdGhlIHVzZXIsIHBhc3Npbmcgc3VjY2VzcyBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIHVzZXIncyBpbmZvXG5cdFx0XHR1c2VyRGF0YS5nZXRVc2VyKCkudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdHUudXNlciA9IGRhdGE7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRjb250cm9sbGVyOiB1c2VyQ3RybCxcblx0XHRcdGNvbnRyb2xsZXJBczogJ3UnLFxuXHRcdFx0dGVtcGxhdGU6ICc8ZGl2IG5nLWlmPVwidS5pc0F1dGhlbnRpY2F0ZWQoKSAmJiAhIXUudXNlclwiIGNsYXNzPVwidXNlciBjbGVhcmZpeFwiPjxpbWcgbmctaWY9XCIhIXUudXNlci5waWN0dXJlXCIgbmctc3JjPVwie3t1LnVzZXIucGljdHVyZX19XCIgY2xhc3M9XCJ1c2VyLXBpY3R1cmVcIiAvPjxzcGFuIGNsYXNzPVwidXNlci1kaXNwbGF5TmFtZVwiPnt7dS51c2VyLmRpc3BsYXlOYW1lfX08L3NwYW4+PC9kaXY+J1xuXHRcdH07XG5cdH1cbn0pKCk7IiwiLy8gVXNlciBBUEkgJGh0dHAgY2FsbHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmZhY3RvcnkoJ3VzZXJEYXRhJywgdXNlckRhdGEpO1xuXG5cdHVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJ107XG5cblx0ZnVuY3Rpb24gdXNlckRhdGEoJGh0dHApIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFVzZXI6IGdldFVzZXIsXG5cdFx0XHR1cGRhdGVVc2VyOiB1cGRhdGVVc2VyLFxuXHRcdFx0Z2V0QWxsVXNlcnM6IGdldEFsbFVzZXJzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHJlc3BvbnNlIHsqfSBkYXRhIGZyb20gJGh0dHBcblx0XHQgKiBAcmV0dXJucyB7Kn0gb2JqZWN0LCBhcnJheVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3N1Y2Nlc3NSZXMocmVzcG9uc2UpIHtcblx0XHRcdGlmICh0eXBlb2YgcmVzcG9uc2UuZGF0YSA9PT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ3JldHJpZXZlZCBkYXRhIGlzIG5vdCB0eXBlb2Ygb2JqZWN0LicpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb24gLSBlcnJvclxuXHRcdCAqIFRocm93cyBhbiBlcnJvciB3aXRoIGVycm9yIGRhdGFcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvciB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2Vycm9yUmVzKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHJldHJpZXZpbmcgZGF0YScsIGVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgY3VycmVudCB1c2VyJ3MgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0VXNlcigpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL21lJylcblx0XHRcdFx0LnRoZW4oX3N1Y2Nlc3NSZXMsIF9lcnJvclJlcyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVXBkYXRlIGN1cnJlbnQgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHByb2ZpbGVEYXRhIHtvYmplY3R9XG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gdXBkYXRlVXNlcihwcm9maWxlRGF0YSkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5wdXQoJy9hcGkvbWUnLCBwcm9maWxlRGF0YSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IGFsbCB1c2VycyAoYWRtaW4gYXV0aG9yaXplZCBvbmx5KVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge3Byb21pc2V9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZ2V0QWxsVXNlcnMoKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LmdldCgnL2FwaS91c2VycycpXG5cdFx0XHRcdC50aGVuKF9zdWNjZXNzUmVzLCBfZXJyb3JSZXMpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdteUFwcCcpXHJcblx0XHQuY29udHJvbGxlcignSGVhZGVyQ3RybCcsIGhlYWRlckN0cmwpO1xyXG5cclxuXHRoZWFkZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckbG9jYXRpb24nLCAnbG9jYWxEYXRhJywgJyRhdXRoJywgJ3VzZXJEYXRhJ107XHJcblxyXG5cdGZ1bmN0aW9uIGhlYWRlckN0cmwoJHNjb3BlLCAkbG9jYXRpb24sIGxvY2FsRGF0YSwgJGF1dGgsIHVzZXJEYXRhKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaGVhZGVyID0gdGhpcztcclxuXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5sb2NhbERhdGEgPSBkYXRhO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxvY2FsRGF0YS5nZXRKU09OKCkudGhlbihfbG9jYWxEYXRhU3VjY2Vzcyk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRoZWFkZXIuYWRtaW5Vc2VyID0gdW5kZWZpbmVkO1xyXG5cdFx0XHQkYXV0aC5sb2dvdXQoKTtcclxuXHRcdFx0JGxvY2F0aW9uLnBhdGgoJy9sb2dpbicpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIG5vdCBkZWZpbmVkIHlldCwgY2hlY2sgaWYgdGhleSdyZSBhbiBhZG1pblxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLmFkbWluVXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0dXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0X2NoZWNrVXNlckFkbWluKCk7XHJcblx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2NoZWNrVXNlckFkbWluKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElzIHRoZSB1c2VyIGF1dGhlbnRpY2F0ZWQ/XHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xyXG5cdFx0fTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKi9cclxuXHRcdGhlYWRlci5pbmRleElzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHQvLyBwYXRoIHNob3VsZCBiZSAnLydcclxuXHRcdFx0cmV0dXJuICRsb2NhdGlvbi5wYXRoKCkgPT09IHBhdGg7XHJcblx0XHR9O1xyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ3VycmVudGx5IGFjdGl2ZSBuYXYgaXRlbVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXHJcblx0XHQgKiBAcmV0dXJucyB7Ym9vbGVhbn1cclxuXHRcdCAqL1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gZnVuY3Rpb24ocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fTtcclxuXHR9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdteUFwcCcpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBuYXZDb250cm9sIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfbGF5b3V0Q2FudmFzID0gXyRib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRcdGRlYm91bmNlOiAxMDBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfbGF5b3V0Q2FudmFzLmNzcyh7XG5cdFx0XHRcdFx0bWluSGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4J1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQoKSB7XG5cdFx0XHRcdGlmIChfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJGF1dGgnLCAnbG9jYWxEYXRhJywgJ1BhZ2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCAkYXV0aCwgbG9jYWxEYXRhLCBQYWdlKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS5zdHJpbmdPZkhUTUwgPSAnPHN0cm9uZz5Tb21lIGJvbGQgdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+ISc7XHJcblx0XHRob21lLmlzQXV0aGVudGljYXRlZCA9IF9pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRob21lLnZpZXdmb3JtYXQgPSBudWxsO1xyXG5cdFx0aG9tZS5sb2NhbERhdGEgPSBudWxsO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBzZXQgcGFnZSB0aXRsZVxyXG5cdFx0XHRQYWdlLnNldFRpdGxlKCdIb21lJyk7XHJcblxyXG5cdFx0XHQvLyBnZXQgbG9jYWwgZGF0YVxyXG5cdFx0XHRsb2NhbERhdGEuZ2V0SlNPTigpLnRoZW4oX2xvY2FsRGF0YVN1Y2Nlc3MpO1xyXG5cclxuXHRcdFx0Ly8gc2V0dXAgbWVkaWFxdWVyeSBmdW5jdGlvbnMgZGVmaW5pbmcgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRGV0ZXJtaW5lcyBpZiB0aGUgdXNlciBpcyBhdXRoZW50aWNhdGVkXHJcblx0XHQgKlxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaXNBdXRoZW50aWNhdGVkKCkge1xyXG5cdFx0XHRyZXR1cm4gJGF1dGguaXNBdXRoZW50aWNhdGVkKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBHZXQgbG9jYWwgZGF0YSBmcm9tIHN0YXRpYyBKU09OXHJcblx0XHQgKlxyXG5cdFx0ICogQHBhcmFtIGRhdGEgKHN1Y2Nlc3NmdWwgcHJvbWlzZSByZXR1cm5zKVxyXG5cdFx0ICogQHJldHVybnMge29iamVjdH0gZGF0YVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhvbWUubG9jYWxEYXRhID0gZGF0YTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVudGVyIHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnc21hbGwnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRXhpdCBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgnbXlBcHAnKVxuXHRcdC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5cdExvZ2luQ3RybC4kaW5qZWN0ID0gWyckYXV0aCcsICdPQVVUSCcsICckcm9vdFNjb3BlJywgJyRsb2NhdGlvbicsICdsb2NhbERhdGEnLCAnUGFnZSddO1xuXG5cdGZ1bmN0aW9uIExvZ2luQ3RybCgkYXV0aCwgT0FVVEgsICRyb290U2NvcGUsICRsb2NhdGlvbiwgbG9jYWxEYXRhLCBQYWdlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBsb2dpbiA9IHRoaXM7XG5cblx0XHRQYWdlLnNldFRpdGxlKCdMb2dpbicpO1xuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gdG8gcnVuIHdoZW4gbG9jYWwgZGF0YSBzdWNjZXNzZnVsXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7SlNPTn1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcblx0XHRcdGxvZ2luLmxvY2FsRGF0YSA9IGRhdGE7XG5cdFx0fVxuXG5cdFx0bG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcblxuXHRcdGxvZ2luLmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGxvZ2luLmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKHByb3ZpZGVyKSB7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSB0cnVlO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIFN1Y2Nlc3NmdWxseSBhdXRoZW50aWNhdGVkXG5cdFx0XHQgKiBHbyB0byBpbml0aWFsbHkgaW50ZW5kZWQgYXV0aGVudGljYXRlZCBwYXRoXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIHJlc3BvbnNlIHtvYmplY3R9IHByb21pc2UgcmVzcG9uc2Vcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hdXRoU3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoJHJvb3RTY29wZS5hdXRoUGF0aCkge1xuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCRyb290U2NvcGUuYXV0aFBhdGgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0JGF1dGguYXV0aGVudGljYXRlKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihfYXV0aFN1Y2Nlc3MpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlLmRhdGEpO1xuXHRcdFx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9ICdlcnJvcic7XG5cdFx0XHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJ1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cbn0pKCk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9