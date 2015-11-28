(function() {
	'use strict';

	angular
		.module('reStart-mean', ['ngRoute', 'ngResource', 'ngSanitize', 'ngMessages', 'mediaCheck', 'resize', 'satellizer']);
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
			if (next.$$route && next.$$route.resolve) {
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

			if (current.$$route && current.$$route.resolve) {
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
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('Utils', Utils);

	Utils.$inject = ['$auth'];

	function Utils($auth) {
		// callable members
		return {
			isAuthenticated: isAuthenticated
		};

		/**
		 * Determines if user is authenticated
		 *
		 * @returns {Boolean}
		 */
		function isAuthenticated() {
			return $auth.isAuthenticated();
		}
	}
})();
// application $auth constants
(function() {
	'use strict';

	var APPAUTH = {
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
	};

	angular
		.module('reStart-mean')
		.constant('APPAUTH', APPAUTH);
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.config(authConfig);

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

})();
// routes
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.config(appConfig)
		.run(appRun);

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

	appRun.$inject = ['$rootScope', '$location', '$auth'];
	/**
	 * AngularJS .run() function
	 *
	 * @param $rootScope
	 * @param $location
	 * @param $auth
	 */
	function appRun($rootScope, $location, $auth) {
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
// Fetch local JSON data
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('LocalData', LocalData);

	LocalData.$inject = ['$http', 'Res'];

	function LocalData($http, Res) {
		/**
		 * Get local JSON data file and return results
		 *
		 * @returns {promise}
		 */
		function getJSON() {
			return $http
				.get('/data/data.json')
				.then(Res.success, Res.error);
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
		.factory('Res', Res);

	function Res() {
		// callable members
		return {
			success: success,
			error: error
		};

		/**
		 * Promise response function
		 * Checks typeof data returned and succeeds if JS object, throws error if not
		 * Useful for APIs (ie, with nginx) where server error HTML page may be returned in error
		 *
		 * @param response {*} data from $http
		 * @returns {*} object, array
		 */
		function success(response) {
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
		 */
		function error(error) {
			throw new Error('Error retrieving data', error);
		}
	}
})();
// User API $http calls
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.factory('UserData', UserData);

	UserData.$inject = ['$http', 'Res'];

	function UserData($http, Res) {
		// callable members
		return {
			getUser: getUser,
			updateUser: updateUser,
			getAllUsers: getAllUsers
		};

		/**
		 * Get current user's data
		 *
		 * @returns {promise}
		 */
		function getUser() {
			return $http
				.get('/api/me')
				.then(Res.success, Res.error);
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
				.then(Res.success, Res.error);
		}
	}
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
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.directive('loading', loading);

	loading.$inject = ['$window', 'resize'];

	function loading($window, resize) {
		// return directive
		return {
			restrict: 'EA',
			replace: true,
			templateUrl: 'ng-app/core/ui/loading.tpl.html',
			transclude: true,
			controller: loadingCtrl,
			controllerAs: 'loading',
			bindToController: true,
			link: loadingLink
		};

		/**
		 * loading LINK
		 * Disables page scrolling when loading overlay is open
		 *
		 * @param $scope
		 * @param $element
		 * @param $attrs
		 * @param loading {controller}
		 */
		function loadingLink($scope, $element, $attrs, loading) {
			// private variables
			var _$body = angular.element('body');
			var _winHeight = $window.innerHeight + 'px';

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
					debounce: 200
				});

				// $watch active state
				$scope.$watch('loading.active', _$watchActive);
			}

			/**
			 * Window resized
			 * If loading, reapply body height
			 * to prevent scrollbar
			 *
			 * @private
			 */
			function _resized() {
				_winHeight = $window.innerHeight + 'px';

				if (loading.active) {
					_$body.css({
						height: _winHeight,
						overflowY: 'hidden'
					});
				}
			}

			/**
			 * $watch loading.active
			 *
			 * @param newVal {boolean}
			 * @param oldVal {undefined|boolean}
			 * @private
			 */
			function _$watchActive(newVal, oldVal) {
				if (newVal) {
					_open();
				} else {
					_close();
				}
			}

			/**
			 * Open loading
			 * Disable scroll
			 *
			 * @private
			 */
			function _open() {
				_$body.css({
					height: _winHeight,
					overflowY: 'hidden'
				});
			}

			/**
			 * Close loading
			 * Enable scroll
			 *
			 * @private
			 */
			function _close() {
				_$body.css({
					height: 'auto',
					overflowY: 'auto'
				});
			}
		}
	}

	loadingCtrl.$inject = ['$scope'];
	/**
	 * loading CONTROLLER
	 * Update the loading status based
	 * on routeChange state
	 */
	function loadingCtrl($scope) {
		var loading = this;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			$scope.$on('loading-on', _loadingActive);
			$scope.$on('loading-off', _loadingInactive);
		}

		/**
		 * Set loading to active
		 *
		 * @private
		 */
		function _loadingActive() {
			loading.active = true;
		}

		/**
		 * Set loading to inactive
		 *
		 * @private
		 */
		function _loadingInactive() {
			loading.active = false;
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
			template: '<div ng-if="u.isAuthenticated() && !!u.user" class="user clearfix"><img ng-if="!!u.user.picture" ng-src="{{u.user.picture}}" class="user-picture" /><span class="user-displayName" ng-bind="::u.user.displayName"></span></div>'
		};
	}

	userCtrl.$inject = ['UserData', 'Utils'];
	/**
	 * User directive controller
	 */
	function userCtrl(UserData, Utils) {
		// controllerAs ViewModel
		var u = this;

		// bindable members
		u.isAuthenticated = Utils.isAuthenticated;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			_activate();
		}

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _activate() {
			// API request to get the user, passing success callback function that sets the user's info
			return UserData.getUser().then(_userSuccess);
		}

		/**
		 * Successful user promise
		 *
		 * @param data {object}
		 * @private
		 */
		function _userSuccess(data) {
			u.user = data;
			return u.user;
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('HeaderCtrl', headerCtrl);

	headerCtrl.$inject = ['$scope', '$location', 'LocalData', '$auth', 'UserData', 'Utils'];

	function headerCtrl($scope, $location, LocalData, $auth, UserData, Utils) {
		// controllerAs ViewModel
		var header = this;

		// bindable members
		header.logout = _logout;
		header.isAuthenticated = Utils.isAuthenticated;
		header.indexIsActive = _indexIsActive;
		header.navIsActive = _navIsActive;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// check if user is an admin
			_checkUserAdmin();

			_activate();

			// check if user is an admin on location change
			$scope.$on('$locationChangeSuccess', _checkUserAdmin);
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return LocalData.getJSON().then(_localDataSuccess);
		}

		/**
		 * Successfully retrieved local data
		 *
		 * @param data
		 * @private
		 */
		function _localDataSuccess(data) {
			header.localData = data;

			$scope.$emit('loading-off');

			return header.localData;
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
				UserData.getUser()
					.then(function(data) {
						header.adminUser = data.isAdmin;
					});
			}
		}

		function _getUserSuccess(data) {
			header.adminUser = data.isAdmin;


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
		.controller('AccountCtrl', AccountCtrl);

	AccountCtrl.$inject = ['$scope', '$auth', 'Utils', 'UserData', '$timeout', 'OAUTH', 'User', 'Page'];

	function AccountCtrl($scope, $auth, Utils, UserData, $timeout, OAUTH, User, Page) {
		// controllerAs ViewModel
		var account = this;

		// bindable members
		account.title = 'My Account';
		account.logins = OAUTH.LOGINS;  // All available login services
		account.isAuthenticated = Utils.isAuthenticated;
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
			Page.setTitle(account.title);

			_btnSaveReset();

			// watch for display name updates
			$scope.$watch('account.user.displayName', _$watchDisplayName);

			_activate();
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			return _getProfile();
		}

		/**
		 * Get user's profile information
		 */
		function _getProfile() {
			$scope.$emit('loading-on');
			return UserData.getUser().then(_getUserSuccess, _getUserError);
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

			$scope.$emit('loading-off');
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

			$scope.$emit('loading-off');
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
				UserData.updateUser(profileData).then(_updateSuccess, _updateError);
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
			return $auth.link(provider)
				.then(account.getProfile)
				.catch(_linkCatch);
		}

		/**
		 * Link promise catch
		 *
		 * @param response
		 * @private
		 */
		function _linkCatch(response) {
			alert(response.data.message);
		}

		/**
		 * Unlink third-party provider
		 *
		 * @param {string} provider
		 */
		function _unlink(provider) {
			return $auth.unlink(provider)
				.then(account.getProfile)
				.catch(_unlinkCatch);
		}

		/**
		 * Unlink promise catch
		 *
		 * @param response
		 * @private
		 */
		function _unlinkCatch(response) {
			alert(response.data ? response.data.message : 'Could not unlink ' + provider + ' account');
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('AdminCtrl', AdminCtrl);

	AdminCtrl.$inject = ['$scope', 'Utils', 'UserData', 'User', 'Page'];

	function AdminCtrl($scope, Utils, UserData, User, Page) {
		// controllerAs ViewModel
		var admin = this;

		// bindable members
		admin.title = 'Admin';
		admin.isAuthenticated = Utils.isAuthenticated;

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			Page.setTitle(admin.title);

			_activate();
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			return UserData.getAllUsers().then(_getAllUsersSuccess, _getAllUsersError);
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

			$scope.$emit('loading-off');
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

			$scope.$emit('loading-off');
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('Error404Ctrl', Error404Ctrl);

	Error404Ctrl.$inject = ['Page'];

	function Error404Ctrl(Page) {
		var e404 = this;

		// bindable members
		e404.title = '404 - Page Not Found';

		_init();

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _init() {
			// set page <title>
			Page.setTitle(e404.title);
		}
	}
})();
(function() {
	'use strict';

	angular
		.module('reStart-mean')
		.controller('HomeCtrl', HomeCtrl);

	HomeCtrl.$inject = ['$scope', 'Utils', 'LocalData', 'Page'];

	function HomeCtrl($scope, Utils, LocalData, Page) {
		// controllerAs ViewModel
		var home = this;

		// bindable members
		home.stringOfHTML = '<strong>Some bold text</strong> bound as HTML with a <a href="#">link</a>!';
		home.isAuthenticated = Utils.isAuthenticated;
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

			_activate();

			// setup mediaquery functions defining home.viewformat
			$scope.$on('enter-mobile', _enterMobile);
			$scope.$on('exit-mobile', _exitMobile);
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			// get local data and return promise
			return LocalData.getJSON().then(_localDataSuccess);
		}

		/**
		 * Get local data from static JSON
		 *
		 * @param data (successful promise returns)
		 * @returns {object} data
		 */
		function _localDataSuccess(data) {
			home.localData = data;

			// stop loading
			$scope.$emit('loading-off');

			return home.localData;
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

	LoginCtrl.$inject = ['$scope', '$auth', 'OAUTH', '$rootScope', '$location', 'LocalData', 'Page'];

	function LoginCtrl($scope, $auth, OAUTH, $rootScope, $location, LocalData, Page) {
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

			_activate();
		}

		/**
		 * Controller activate
		 * Get JSON data
		 *
		 * @returns {*}
		 * @private
		 */
		function _activate() {
			$scope.$emit('loading-on');

			// get local data
			return LocalData.getJSON().then(_localDataSuccess);
		}

		/**
		 * Function to run when local data successful
		 *
		 * @param data {JSON}
		 * @private
		 */
		function _localDataSuccess(data) {
			login.localData = data;

			$scope.$emit('loading-off');

			return login.localData;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5tb2R1bGUuanMiLCJjb3JlL09BVVRILmNvbnN0YW50LmpzIiwiY29yZS9QYWdlLmN0cmwuanMiLCJjb3JlL1BhZ2UuZmFjdG9yeS5qcyIsImNvcmUvVXNlci5mYWN0b3J5LmpzIiwiY29yZS9VdGlscy5mYWN0b3J5LmpzIiwiY29yZS9hcHAtc2V0dXAvYXBwLkFVVEguY29uc3RhbnQuanMiLCJjb3JlL2FwcC1zZXR1cC9hcHAuY29uZmlnLmF1dGguanMiLCJjb3JlL2FwcC1zZXR1cC9hcHAuY29uZmlnLnJvdXRpbmcuanMiLCJjb3JlL2dldC1kYXRhL0xvY2FsRGF0YS5mYWN0b3J5LmpzIiwiY29yZS9nZXQtZGF0YS9SZXMuZmFjdG9yeS5qcyIsImNvcmUvZ2V0LWRhdGEvVXNlckRhdGEuZmFjdG9yeS5qcyIsImNvcmUvdWkvTVEuY29uc3RhbnQuanMiLCJjb3JlL3VpL2RldGVjdEFkQmxvY2suZGlyLmpzIiwiY29yZS91aS9sb2FkaW5nLmRpci5qcyIsImNvcmUvdWkvdHJ1c3RBc0hUTUwuZmlsdGVyLmpzIiwiY29yZS91aS91c2VyLmRpci5qcyIsIm1vZHVsZXMvaGVhZGVyL0hlYWRlci5jdHJsLmpzIiwibW9kdWxlcy9oZWFkZXIvbmF2Q29udHJvbC5kaXIuanMiLCJwYWdlcy9hY2NvdW50L0FjY291bnQuY3RybC5qcyIsInBhZ2VzL2FkbWluL0FkbWluLmN0cmwuanMiLCJwYWdlcy9lcnJvcjQwNC9FcnJvcjQwNC5jdHJsLmpzIiwicGFnZXMvaG9tZS9Ib21lLmN0cmwuanMiLCJwYWdlcy9sb2dpbi9Mb2dpbi5jdHJsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZy1hcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJywgWyduZ1JvdXRlJywgJ25nUmVzb3VyY2UnLCAnbmdTYW5pdGl6ZScsICduZ01lc3NhZ2VzJywgJ21lZGlhQ2hlY2snLCAncmVzaXplJywgJ3NhdGVsbGl6ZXInXSk7XG59KSgpOyIsIi8vIGxvZ2luL09hdXRoIGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE9BVVRIID0ge1xuXHRcdExPR0lOUzogW1xuXHRcdFx0e1xuXHRcdFx0XHRhY2NvdW50OiAnZ29vZ2xlJyxcblx0XHRcdFx0bmFtZTogJ0dvb2dsZScsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9hY2NvdW50cy5nb29nbGUuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAndHdpdHRlcicsXG5cdFx0XHRcdG5hbWU6ICdUd2l0dGVyJyxcblx0XHRcdFx0dXJsOiAnaHR0cDovL3R3aXR0ZXIuY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZmFjZWJvb2snLFxuXHRcdFx0XHRuYW1lOiAnRmFjZWJvb2snLFxuXHRcdFx0XHR1cmw6ICdodHRwOi8vZmFjZWJvb2suY29tJ1xuXHRcdFx0fSwge1xuXHRcdFx0XHRhY2NvdW50OiAnZ2l0aHViJyxcblx0XHRcdFx0bmFtZTogJ0dpdEh1YicsXG5cdFx0XHRcdHVybDogJ2h0dHA6Ly9naXRodWIuY29tJ1xuXHRcdFx0fVxuXHRcdF1cblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29uc3RhbnQoJ09BVVRIJywgT0FVVEgpO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29udHJvbGxlcignUGFnZUN0cmwnLCBQYWdlQ3RybCk7XG5cblx0UGFnZUN0cmwuJGluamVjdCA9IFsnUGFnZScsICckc2NvcGUnLCAnTVEnLCAnbWVkaWFDaGVjayddO1xuXG5cdGZ1bmN0aW9uIFBhZ2VDdHJsKFBhZ2UsICRzY29wZSwgTVEsIG1lZGlhQ2hlY2spIHtcblx0XHR2YXIgcGFnZSA9IHRoaXM7XG5cblx0XHQvLyBwcml2YXRlIHZhcmlhYmxlc1xuXHRcdHZhciBfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yID0gZmFsc2U7XG5cdFx0Ly8gU2V0IHVwIGZ1bmN0aW9uYWxpdHkgdG8gcnVuIG9uIGVudGVyL2V4aXQgb2YgbWVkaWEgcXVlcnlcblx0XHR2YXIgbWMgPSBtZWRpYUNoZWNrLmluaXQoe1xuXHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdG1lZGlhOiB7XG5cdFx0XHRcdG1xOiBNUS5TTUFMTCxcblx0XHRcdFx0ZW50ZXI6IF9lbnRlck1vYmlsZSxcblx0XHRcdFx0ZXhpdDogX2V4aXRNb2JpbGVcblx0XHRcdH0sXG5cdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0fSk7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBhc3NvY2lhdGUgcGFnZSA8dGl0bGU+XG5cdFx0XHRwYWdlLnBhZ2VUaXRsZSA9IFBhZ2U7XG5cblx0XHRcdCRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgX3JvdXRlQ2hhbmdlU3RhcnQpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3VjY2VzcycsIF9yb3V0ZUNoYW5nZVN1Y2Nlc3MpO1xuXHRcdFx0JHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlRXJyb3InLCBfcm91dGVDaGFuZ2VFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRW50ZXIgbW9iaWxlIG1lZGlhIHF1ZXJ5XG5cdFx0ICogJGJyb2FkY2FzdCAnZW50ZXItbW9iaWxlJyBldmVudFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZW50ZXJNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZW50ZXItbW9iaWxlJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRXhpdCBtb2JpbGUgbWVkaWEgcXVlcnlcblx0XHQgKiAkYnJvYWRjYXN0ICdleGl0LW1vYmlsZScgZXZlbnRcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGJyb2FkY2FzdCgnZXhpdC1tb2JpbGUnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBUdXJuIG9uIGxvYWRpbmcgc3RhdGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvYWRpbmdPbigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9uJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVHVybiBvZmYgbG9hZGluZyBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfbG9hZGluZ09mZigpIHtcblx0XHRcdCRzY29wZS4kYnJvYWRjYXN0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJvdXRlIGNoYW5nZSBzdGFydCBoYW5kbGVyXG5cdFx0ICogSWYgbmV4dCByb3V0ZSBoYXMgcmVzb2x2ZSwgdHVybiBvbiBsb2FkaW5nXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIG5leHQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gY3VycmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3JvdXRlQ2hhbmdlU3RhcnQoJGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHRpZiAobmV4dC4kJHJvdXRlICYmIG5leHQuJCRyb3V0ZS5yZXNvbHZlKSB7XG5cdFx0XHRcdF9sb2FkaW5nT24oKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2Ugc3VjY2VzcyBoYW5kbGVyXG5cdFx0ICogTWF0Y2ggY3VycmVudCBtZWRpYSBxdWVyeSBhbmQgcnVuIGFwcHJvcHJpYXRlIGZ1bmN0aW9uXG5cdFx0ICogSWYgY3VycmVudCByb3V0ZSBoYXMgYmVlbiByZXNvbHZlZCwgdHVybiBvZmYgbG9hZGluZ1xuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRldmVudCB7b2JqZWN0fVxuXHRcdCAqIEBwYXJhbSBjdXJyZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIHByZXZpb3VzIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VTdWNjZXNzKCRldmVudCwgY3VycmVudCwgcHJldmlvdXMpIHtcblx0XHRcdG1jLm1hdGNoQ3VycmVudChNUS5TTUFMTCk7XG5cblx0XHRcdGlmIChjdXJyZW50LiQkcm91dGUgJiYgY3VycmVudC4kJHJvdXRlLnJlc29sdmUpIHtcblx0XHRcdFx0X2xvYWRpbmdPZmYoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBSb3V0ZSBjaGFuZ2UgZXJyb3IgaGFuZGxlclxuXHRcdCAqIEhhbmRsZSByb3V0ZSByZXNvbHZlIGZhaWx1cmVzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gJGV2ZW50IHtvYmplY3R9XG5cdFx0ICogQHBhcmFtIGN1cnJlbnQge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcHJldmlvdXMge29iamVjdH1cblx0XHQgKiBAcGFyYW0gcmVqZWN0aW9uIHtvYmplY3R9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfcm91dGVDaGFuZ2VFcnJvcigkZXZlbnQsIGN1cnJlbnQsIHByZXZpb3VzLCByZWplY3Rpb24pIHtcblx0XHRcdGlmIChfaGFuZGxpbmdSb3V0ZUNoYW5nZUVycm9yKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0X2hhbmRsaW5nUm91dGVDaGFuZ2VFcnJvciA9IHRydWU7XG5cdFx0XHRfbG9hZGluZ09mZigpO1xuXG5cdFx0XHR2YXIgZGVzdGluYXRpb24gPSAoY3VycmVudCAmJiAoY3VycmVudC50aXRsZSB8fCBjdXJyZW50Lm5hbWUgfHwgY3VycmVudC5sb2FkZWRUZW1wbGF0ZVVybCkpIHx8ICd1bmtub3duIHRhcmdldCc7XG5cdFx0XHR2YXIgbXNnID0gJ0Vycm9yIHJvdXRpbmcgdG8gJyArIGRlc3RpbmF0aW9uICsgJy4gJyArIChyZWplY3Rpb24ubXNnIHx8ICcnKTtcblxuXHRcdFx0Y29uc29sZS5sb2cobXNnKTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPbiByb3V0aW5nIGVycm9yLCBzaG93IGFuIGVycm9yLlxuXHRcdFx0ICovXG5cdFx0XHRhbGVydCgnQW4gZXJyb3Igb2NjdXJyZWQuIFBsZWFzZSB0cnkgYWdhaW4uJyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5mYWN0b3J5KCdQYWdlJywgUGFnZSk7XG5cblx0ZnVuY3Rpb24gUGFnZSgpIHtcblx0XHQvLyBwcml2YXRlIHZhcnNcblx0XHR2YXIgc2l0ZVRpdGxlID0gJ3JlU3RhcnQtbWVhbic7XG5cdFx0dmFyIHBhZ2VUaXRsZSA9ICdIb21lJztcblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0VGl0bGU6IGdldFRpdGxlLFxuXHRcdFx0c2V0VGl0bGU6IHNldFRpdGxlXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFRpdGxlIGZ1bmN0aW9uXG5cdFx0ICogU2V0cyBzaXRlIHRpdGxlIGFuZCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7c3RyaW5nfSBzaXRlIHRpdGxlICsgcGFnZSB0aXRsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldFRpdGxlKCkge1xuXHRcdFx0cmV0dXJuIHNpdGVUaXRsZSArICcgfCAnICsgcGFnZVRpdGxlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBwYWdlIHRpdGxlXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gbmV3VGl0bGUge3N0cmluZ31cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBzZXRUaXRsZShuZXdUaXRsZSkge1xuXHRcdFx0cGFnZVRpdGxlID0gbmV3VGl0bGU7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIFVzZXIgZnVuY3Rpb25zXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZmFjdG9yeSgnVXNlcicsIFVzZXIpO1xuXG5cdFVzZXIuJGluamVjdCA9IFsnT0FVVEgnXTtcblxuXHRmdW5jdGlvbiBVc2VyKE9BVVRIKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRnZXRMaW5rZWRBY2NvdW50czogZ2V0TGlua2VkQWNjb3VudHNcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlIGFycmF5IG9mIGEgdXNlcidzIGN1cnJlbnRseS1saW5rZWQgYWNjb3VudCBsb2dpbnNcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB1c2VyT2JqXG5cdFx0ICogQHJldHVybnMge0FycmF5fVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGdldExpbmtlZEFjY291bnRzKHVzZXJPYmopIHtcblx0XHRcdHZhciBsaW5rZWRBY2NvdW50cyA9IFtdO1xuXG5cdFx0XHRhbmd1bGFyLmZvckVhY2goT0FVVEguTE9HSU5TLCBmdW5jdGlvbihhY3RPYmopIHtcblx0XHRcdFx0dmFyIGFjdCA9IGFjdE9iai5hY2NvdW50O1xuXG5cdFx0XHRcdGlmICh1c2VyT2JqW2FjdF0pIHtcblx0XHRcdFx0XHRsaW5rZWRBY2NvdW50cy5wdXNoKGFjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4gbGlua2VkQWNjb3VudHM7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5mYWN0b3J5KCdVdGlscycsIFV0aWxzKTtcblxuXHRVdGlscy4kaW5qZWN0ID0gWyckYXV0aCddO1xuXG5cdGZ1bmN0aW9uIFV0aWxzKCRhdXRoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRpc0F1dGhlbnRpY2F0ZWQ6IGlzQXV0aGVudGljYXRlZFxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEZXRlcm1pbmVzIGlmIHVzZXIgaXMgYXV0aGVudGljYXRlZFxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkKCkge1xuXHRcdFx0cmV0dXJuICRhdXRoLmlzQXV0aGVudGljYXRlZCgpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBhcHBsaWNhdGlvbiAkYXV0aCBjb25zdGFudHNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBBUFBBVVRIID0ge1xuXHRcdExPR0lOX1VSTDoge1xuXHRcdFx0Ly8gY2hhbmdlIFBST0QgZG9tYWluIHRvIHlvdXIgb3duXG5cdFx0XHRQUk9EOiAnaHR0cDovL3Jlc3RhcnQtbWVhbi5rbWFpZGEubmV0L2F1dGgvbG9naW4nLFxuXHRcdFx0REVWOiAnaHR0cDovL2xvY2FsaG9zdDo4MDgxL2F1dGgvbG9naW4nXG5cdFx0fSxcblx0XHRDTElFTlRJRFM6IHtcblx0XHRcdC8vIGNoYW5nZSB0aGVzZSBjbGllbnQgSURzIHRvIHlvdXIgb3duXG5cdFx0XHRGQUNFQk9PSzogJzM0Mzc4OTI0OTE0Njk2NicsXG5cdFx0XHRHT09HTEU6ICc0Nzk2NTEzNjczMzAtdHJ2ZjhlZm9vNDE1aWUwdXNmaG00aTU5NDEwdmszajkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20nLFxuXHRcdFx0R0lUSFVCOiAnODA5NmU5NWMyZWJhMzNiODFhZGInXG5cdFx0fVxuXHR9O1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb25zdGFudCgnQVBQQVVUSCcsIEFQUEFVVEgpO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29uZmlnKGF1dGhDb25maWcpO1xuXG5cdGF1dGhDb25maWcuJGluamVjdCA9IFsnJGF1dGhQcm92aWRlcicsICdBUFBBVVRIJ107XG5cdC8qKlxuXHQgKiBBbmd1bGFySlMgLmNvbmZpZygpIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSAkYXV0aFByb3ZpZGVyIC0gU2F0ZWxsaXplciBwcm92aWRlclxuXHQgKiBAcGFyYW0gQVBQQVVUSCB7b2JqZWN0fSBhcHAgYXV0aCBjb25zdGFudHNcblx0ICovXG5cdGZ1bmN0aW9uIGF1dGhDb25maWcoJGF1dGhQcm92aWRlciwgQVBQQVVUSCkge1xuXHRcdC8vIGJlY2F1c2UgcHJvdmlkZXJzIChpZSwgJGxvY2F0aW9uLCAkd2luZG93KSBjYW5ub3QgYmUgaW5qZWN0ZWQgaW4gY29uZmlnLFxuXHRcdC8vIGRldi9wcm9kIGxvZ2luIFVSTHMgbXVzdCBiZSBzd2FwcGVkIG1hbnVhbGx5XG5cblx0XHQvLyRhdXRoUHJvdmlkZXIubG9naW5VcmwgPSBBUFBBVVRILkxPR0lOX1VSTC5ERVY7XG5cdFx0JGF1dGhQcm92aWRlci5sb2dpblVybCA9IEFQUEFVVEguTE9HSU5fVVJMLlBST0Q7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcblx0XHRcdGNsaWVudElkOiBBUFBBVVRILkNMSUVOVElEUy5GQUNFQk9PS1xuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci5nb29nbGUoe1xuXHRcdFx0Y2xpZW50SWQ6IEFQUEFVVEguQ0xJRU5USURTLkdPT0dMRVxuXHRcdH0pO1xuXG5cdFx0JGF1dGhQcm92aWRlci50d2l0dGVyKHtcblx0XHRcdHVybDogJy9hdXRoL3R3aXR0ZXInXG5cdFx0fSk7XG5cblx0XHQkYXV0aFByb3ZpZGVyLmdpdGh1Yih7XG5cdFx0XHRjbGllbnRJZDogQVBQQVVUSC5DTElFTlRJRFMuR0lUSFVCXG5cdFx0fSk7XG5cdH1cblxufSkoKTsiLCIvLyByb3V0ZXNcbihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb25maWcoYXBwQ29uZmlnKVxuXHRcdC5ydW4oYXBwUnVuKTtcblxuXHRhcHBDb25maWcuJGluamVjdCA9IFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInXTtcblxuXHRmdW5jdGlvbiBhcHBDb25maWcoJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG5cdFx0JHJvdXRlUHJvdmlkZXJcblx0XHRcdC53aGVuKCcvJywge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9wYWdlcy9ob21lL0hvbWUudmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0hvbWVDdHJsJyxcblx0XHRcdFx0Y29udHJvbGxlckFzOiAnaG9tZScsXG5cdFx0XHRcdHNlY3VyZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHRcdC53aGVuKCcvbG9naW4nLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2xvZ2luL0xvZ2luLnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdsb2dpbidcblx0XHRcdH0pXG5cdFx0XHQud2hlbignL2FjY291bnQnLCB7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2FjY291bnQvQWNjb3VudC52aWV3Lmh0bWwnLFxuXHRcdFx0XHRjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdhY2NvdW50Jyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0LndoZW4oJy9hZG1pbicsIHtcblx0XHRcdFx0dGVtcGxhdGVVcmw6ICduZy1hcHAvcGFnZXMvYWRtaW4vQWRtaW4udmlldy5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0FkbWluQ3RybCcsXG5cdFx0XHRcdGNvbnRyb2xsZXJBczogJ2FkbWluJyxcblx0XHRcdFx0c2VjdXJlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdFx0Lm90aGVyd2lzZSh7XG5cdFx0XHRcdHRlbXBsYXRlVXJsOiAnbmctYXBwL3BhZ2VzL2Vycm9yNDA0L0Vycm9yNDA0LnZpZXcuaHRtbCcsXG5cdFx0XHRcdGNvbnRyb2xsZXI6ICdFcnJvcjQwNEN0cmwnLFxuXHRcdFx0XHRjb250cm9sbGVyQXM6ICdlNDA0J1xuXHRcdFx0fSk7XG5cblx0XHQkbG9jYXRpb25Qcm92aWRlclxuXHRcdFx0Lmh0bWw1TW9kZSh7XG5cdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdH0pXG5cdFx0XHQuaGFzaFByZWZpeCgnIScpO1xuXHR9XG5cblx0YXBwUnVuLiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJyRhdXRoJ107XG5cdC8qKlxuXHQgKiBBbmd1bGFySlMgLnJ1bigpIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSAkcm9vdFNjb3BlXG5cdCAqIEBwYXJhbSAkbG9jYXRpb25cblx0ICogQHBhcmFtICRhdXRoXG5cdCAqL1xuXHRmdW5jdGlvbiBhcHBSdW4oJHJvb3RTY29wZSwgJGxvY2F0aW9uLCAkYXV0aCkge1xuXHRcdCRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCBuZXh0LCBjdXJyZW50KSB7XG5cdFx0XHR2YXIgX3BhdGg7XG5cblx0XHRcdGlmIChuZXh0ICYmIG5leHQuJCRyb3V0ZSAmJiBuZXh0LiQkcm91dGUuc2VjdXJlICYmICEkYXV0aC5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuXHRcdFx0XHRfcGF0aCA9ICRsb2NhdGlvbi5wYXRoKCk7XG5cblx0XHRcdFx0JHJvb3RTY29wZS5hdXRoUGF0aCA9IF9wYXRoLmluZGV4T2YoJ2xvZ2luJykgPT09IC0xID8gX3BhdGggOiAnLyc7XG5cblx0XHRcdFx0JHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHNlbmQgdXNlciB0byBsb2dpblxuXHRcdFx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pKCk7IiwiLy8gRmV0Y2ggbG9jYWwgSlNPTiBkYXRhXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZmFjdG9yeSgnTG9jYWxEYXRhJywgTG9jYWxEYXRhKTtcblxuXHRMb2NhbERhdGEuJGluamVjdCA9IFsnJGh0dHAnLCAnUmVzJ107XG5cblx0ZnVuY3Rpb24gTG9jYWxEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvKipcblx0XHQgKiBHZXQgbG9jYWwgSlNPTiBkYXRhIGZpbGUgYW5kIHJldHVybiByZXN1bHRzXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRKU09OKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9kYXRhL2RhdGEuanNvbicpXG5cdFx0XHRcdC50aGVuKFJlcy5zdWNjZXNzLCBSZXMuZXJyb3IpO1xuXHRcdH1cblxuXHRcdC8vIGNhbGxhYmxlIG1lbWJlcnNcblx0XHRyZXR1cm4ge1xuXHRcdFx0Z2V0SlNPTjogZ2V0SlNPTlxuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZmFjdG9yeSgnUmVzJywgUmVzKTtcblxuXHRmdW5jdGlvbiBSZXMoKSB7XG5cdFx0Ly8gY2FsbGFibGUgbWVtYmVyc1xuXHRcdHJldHVybiB7XG5cdFx0XHRzdWNjZXNzOiBzdWNjZXNzLFxuXHRcdFx0ZXJyb3I6IGVycm9yXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFByb21pc2UgcmVzcG9uc2UgZnVuY3Rpb25cblx0XHQgKiBDaGVja3MgdHlwZW9mIGRhdGEgcmV0dXJuZWQgYW5kIHN1Y2NlZWRzIGlmIEpTIG9iamVjdCwgdGhyb3dzIGVycm9yIGlmIG5vdFxuXHRcdCAqIFVzZWZ1bCBmb3IgQVBJcyAoaWUsIHdpdGggbmdpbngpIHdoZXJlIHNlcnZlciBlcnJvciBIVE1MIHBhZ2UgbWF5IGJlIHJldHVybmVkIGluIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Ugeyp9IGRhdGEgZnJvbSAkaHR0cFxuXHRcdCAqIEByZXR1cm5zIHsqfSBvYmplY3QsIGFycmF5XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gc3VjY2VzcyhyZXNwb25zZSkge1xuXHRcdFx0aWYgKHR5cGVvZiByZXNwb25zZS5kYXRhID09PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigncmV0cmlldmVkIGRhdGEgaXMgbm90IHR5cGVvZiBvYmplY3QuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogUHJvbWlzZSByZXNwb25zZSBmdW5jdGlvbiAtIGVycm9yXG5cdFx0ICogVGhyb3dzIGFuIGVycm9yIHdpdGggZXJyb3IgZGF0YVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGVycm9yIHtvYmplY3R9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZXJyb3IoZXJyb3IpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3IgcmV0cmlldmluZyBkYXRhJywgZXJyb3IpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIvLyBVc2VyIEFQSSAkaHR0cCBjYWxsc1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmZhY3RvcnkoJ1VzZXJEYXRhJywgVXNlckRhdGEpO1xuXG5cdFVzZXJEYXRhLiRpbmplY3QgPSBbJyRodHRwJywgJ1JlcyddO1xuXG5cdGZ1bmN0aW9uIFVzZXJEYXRhKCRodHRwLCBSZXMpIHtcblx0XHQvLyBjYWxsYWJsZSBtZW1iZXJzXG5cdFx0cmV0dXJuIHtcblx0XHRcdGdldFVzZXI6IGdldFVzZXIsXG5cdFx0XHR1cGRhdGVVc2VyOiB1cGRhdGVVc2VyLFxuXHRcdFx0Z2V0QWxsVXNlcnM6IGdldEFsbFVzZXJzXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEdldCBjdXJyZW50IHVzZXIncyBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRVc2VyKCkge1xuXHRcdFx0cmV0dXJuICRodHRwXG5cdFx0XHRcdC5nZXQoJy9hcGkvbWUnKVxuXHRcdFx0XHQudGhlbihSZXMuc3VjY2VzcywgUmVzLmVycm9yKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVcGRhdGUgY3VycmVudCB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcHJvZmlsZURhdGEge29iamVjdH1cblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiB1cGRhdGVVc2VyKHByb2ZpbGVEYXRhKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHBcblx0XHRcdFx0LnB1dCgnL2FwaS9tZScsIHByb2ZpbGVEYXRhKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBHZXQgYWxsIHVzZXJzIChhZG1pbiBhdXRob3JpemVkIG9ubHkpXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7cHJvbWlzZX1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBnZXRBbGxVc2VycygpIHtcblx0XHRcdHJldHVybiAkaHR0cFxuXHRcdFx0XHQuZ2V0KCcvYXBpL3VzZXJzJylcblx0XHRcdFx0LnRoZW4oUmVzLnN1Y2Nlc3MsIFJlcy5lcnJvcik7XG5cdFx0fVxuXHR9XG59KSgpOyIsIi8vIG1lZGlhIHF1ZXJ5IGNvbnN0YW50c1xuKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0dmFyIE1RID0ge1xuXHRcdFNNQUxMOiAnKG1heC13aWR0aDogNzY3cHgpJyxcblx0XHRMQVJHRTogJyhtaW4td2lkdGg6IDc2OHB4KSdcblx0fTtcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29uc3RhbnQoJ01RJywgTVEpO1xufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmRpcmVjdGl2ZSgnZGV0ZWN0QWRibG9jaycsIGRldGVjdEFkYmxvY2spO1xuXG5cdGRldGVjdEFkYmxvY2suJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJGxvY2F0aW9uJ107XG5cblx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9jaygkdGltZW91dCwgJGxvY2F0aW9uKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdGxpbms6IGRldGVjdEFkYmxvY2tMaW5rLFxuXHRcdFx0dGVtcGxhdGU6ICAgJzxkaXYgY2xhc3M9XCJhZC10ZXN0IGZhLWZhY2Vib29rIGZhLXR3aXR0ZXJcIiBzdHlsZT1cImhlaWdodDoxcHg7XCI+PC9kaXY+JyArXG5cdFx0XHRcdFx0XHQnPGRpdiBuZy1pZj1cImFiLmJsb2NrZWRcIiBjbGFzcz1cImFiLW1lc3NhZ2UgYWxlcnQgYWxlcnQtZGFuZ2VyXCI+JyArXG5cdFx0XHRcdFx0XHQnPGkgY2xhc3M9XCJmYSBmYS1iYW5cIj48L2k+IDxzdHJvbmc+QWRCbG9jazwvc3Ryb25nPiBpcyBwcm9oaWJpdGluZyBpbXBvcnRhbnQgZnVuY3Rpb25hbGl0eSEgUGxlYXNlIGRpc2FibGUgYWQgYmxvY2tpbmcgb24gPHN0cm9uZz57e2FiLmhvc3R9fTwvc3Ryb25nPi4gVGhpcyBzaXRlIGlzIGFkLWZyZWUuJyArXG5cdFx0XHRcdFx0XHQnPC9kaXY+J1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBkZXRlY3RBZGJsb2NrIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKiBAcGFyYW0gJGVsZW1cblx0XHQgKiBAcGFyYW0gJGF0dHJzXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZGV0ZWN0QWRibG9ja0xpbmsoJHNjb3BlLCAkZWxlbSwgJGF0dHJzKSB7XG5cdFx0XHQvLyBkYXRhIG9iamVjdFxuXHRcdFx0JHNjb3BlLmFiID0ge307XG5cblx0XHRcdC8vIGhvc3RuYW1lIGZvciBtZXNzYWdpbmdcblx0XHRcdCRzY29wZS5hYi5ob3N0ID0gJGxvY2F0aW9uLmhvc3QoKTtcblxuXHRcdFx0JHRpbWVvdXQoX2FyZUFkc0Jsb2NrZWQsIDIwMCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2hlY2sgaWYgYWRzIGFyZSBibG9ja2VkIC0gY2FsbGVkIGluICR0aW1lb3V0IHRvIGxldCBBZEJsb2NrZXJzIHJ1blxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9hcmVBZHNCbG9ja2VkKCkge1xuXHRcdFx0XHR2YXIgX2EgPSAkZWxlbS5maW5kKCcuYWQtdGVzdCcpO1xuXG5cdFx0XHRcdCRzY29wZS5hYi5ibG9ja2VkID0gX2EuaGVpZ2h0KCkgPD0gMCB8fCAhJGVsZW0uZmluZCgnLmFkLXRlc3Q6dmlzaWJsZScpLmxlbmd0aDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZGlyZWN0aXZlKCdsb2FkaW5nJywgbG9hZGluZyk7XG5cblx0bG9hZGluZy4kaW5qZWN0ID0gWyckd2luZG93JywgJ3Jlc2l6ZSddO1xuXG5cdGZ1bmN0aW9uIGxvYWRpbmcoJHdpbmRvdywgcmVzaXplKSB7XG5cdFx0Ly8gcmV0dXJuIGRpcmVjdGl2ZVxuXHRcdHJldHVybiB7XG5cdFx0XHRyZXN0cmljdDogJ0VBJyxcblx0XHRcdHJlcGxhY2U6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZVVybDogJ25nLWFwcC9jb3JlL3VpL2xvYWRpbmcudHBsLmh0bWwnLFxuXHRcdFx0dHJhbnNjbHVkZTogdHJ1ZSxcblx0XHRcdGNvbnRyb2xsZXI6IGxvYWRpbmdDdHJsLFxuXHRcdFx0Y29udHJvbGxlckFzOiAnbG9hZGluZycsXG5cdFx0XHRiaW5kVG9Db250cm9sbGVyOiB0cnVlLFxuXHRcdFx0bGluazogbG9hZGluZ0xpbmtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogbG9hZGluZyBMSU5LXG5cdFx0ICogRGlzYWJsZXMgcGFnZSBzY3JvbGxpbmcgd2hlbiBsb2FkaW5nIG92ZXJsYXkgaXMgb3BlblxuXHRcdCAqXG5cdFx0ICogQHBhcmFtICRzY29wZVxuXHRcdCAqIEBwYXJhbSAkZWxlbWVudFxuXHRcdCAqIEBwYXJhbSAkYXR0cnNcblx0XHQgKiBAcGFyYW0gbG9hZGluZyB7Y29udHJvbGxlcn1cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBsb2FkaW5nTGluaygkc2NvcGUsICRlbGVtZW50LCAkYXR0cnMsIGxvYWRpbmcpIHtcblx0XHRcdC8vIHByaXZhdGUgdmFyaWFibGVzXG5cdFx0XHR2YXIgXyRib2R5ID0gYW5ndWxhci5lbGVtZW50KCdib2R5Jyk7XG5cdFx0XHR2YXIgX3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRfaW5pdCgpO1xuXG5cdFx0XHQvKipcblx0XHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRcdC8vIGluaXRpYWxpemUgZGVib3VuY2VkIHJlc2l6ZVxuXHRcdFx0XHR2YXIgX3JzID0gcmVzaXplLmluaXQoe1xuXHRcdFx0XHRcdHNjb3BlOiAkc2NvcGUsXG5cdFx0XHRcdFx0cmVzaXplZEZuOiBfcmVzaXplZCxcblx0XHRcdFx0XHRkZWJvdW5jZTogMjAwXG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vICR3YXRjaCBhY3RpdmUgc3RhdGVcblx0XHRcdFx0JHNjb3BlLiR3YXRjaCgnbG9hZGluZy5hY3RpdmUnLCBfJHdhdGNoQWN0aXZlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaW5kb3cgcmVzaXplZFxuXHRcdFx0ICogSWYgbG9hZGluZywgcmVhcHBseSBib2R5IGhlaWdodFxuXHRcdFx0ICogdG8gcHJldmVudCBzY3JvbGxiYXJcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfcmVzaXplZCgpIHtcblx0XHRcdFx0X3dpbkhlaWdodCA9ICR3aW5kb3cuaW5uZXJIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHRcdGlmIChsb2FkaW5nLmFjdGl2ZSkge1xuXHRcdFx0XHRcdF8kYm9keS5jc3Moe1xuXHRcdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdFx0b3ZlcmZsb3dZOiAnaGlkZGVuJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogJHdhdGNoIGxvYWRpbmcuYWN0aXZlXG5cdFx0XHQgKlxuXHRcdFx0ICogQHBhcmFtIG5ld1ZhbCB7Ym9vbGVhbn1cblx0XHRcdCAqIEBwYXJhbSBvbGRWYWwge3VuZGVmaW5lZHxib29sZWFufVxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gXyR3YXRjaEFjdGl2ZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0XHRpZiAobmV3VmFsKSB7XG5cdFx0XHRcdFx0X29wZW4oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfY2xvc2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wZW4gbG9hZGluZ1xuXHRcdFx0ICogRGlzYWJsZSBzY3JvbGxcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfb3BlbigpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiBfd2luSGVpZ2h0LFxuXHRcdFx0XHRcdG92ZXJmbG93WTogJ2hpZGRlbidcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogQ2xvc2UgbG9hZGluZ1xuXHRcdFx0ICogRW5hYmxlIHNjcm9sbFxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZSgpIHtcblx0XHRcdFx0XyRib2R5LmNzcyh7XG5cdFx0XHRcdFx0aGVpZ2h0OiAnYXV0bycsXG5cdFx0XHRcdFx0b3ZlcmZsb3dZOiAnYXV0bydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0bG9hZGluZ0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJ107XG5cdC8qKlxuXHQgKiBsb2FkaW5nIENPTlRST0xMRVJcblx0ICogVXBkYXRlIHRoZSBsb2FkaW5nIHN0YXR1cyBiYXNlZFxuXHQgKiBvbiByb3V0ZUNoYW5nZSBzdGF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gbG9hZGluZ0N0cmwoJHNjb3BlKSB7XG5cdFx0dmFyIGxvYWRpbmcgPSB0aGlzO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0JHNjb3BlLiRvbignbG9hZGluZy1vbicsIF9sb2FkaW5nQWN0aXZlKTtcblx0XHRcdCRzY29wZS4kb24oJ2xvYWRpbmctb2ZmJywgX2xvYWRpbmdJbmFjdGl2ZSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGxvYWRpbmcgdG8gYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nQWN0aXZlKCkge1xuXHRcdFx0bG9hZGluZy5hY3RpdmUgPSB0cnVlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFNldCBsb2FkaW5nIHRvIGluYWN0aXZlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9sb2FkaW5nSW5hY3RpdmUoKSB7XG5cdFx0XHRsb2FkaW5nLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5maWx0ZXIoJ3RydXN0QXNIVE1MJywgdHJ1c3RBc0hUTUwpO1xuXG5cdHRydXN0QXNIVE1MLiRpbmplY3QgPSBbJyRzY2UnXTtcblxuXHRmdW5jdGlvbiB0cnVzdEFzSFRNTCgkc2NlKSB7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uICh0ZXh0KSB7XG5cdFx0XHRyZXR1cm4gJHNjZS50cnVzdEFzSHRtbCh0ZXh0KTtcblx0XHR9O1xuXHR9XG59KSgpOyIsIi8vIFVzZXIgZGlyZWN0aXZlXG4oZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuZGlyZWN0aXZlKCd1c2VyJywgdXNlcik7XG5cblx0ZnVuY3Rpb24gdXNlcigpIHtcblx0XHQvLyByZXR1cm4gZGlyZWN0aXZlXG5cdFx0cmV0dXJuIHtcblx0XHRcdHJlc3RyaWN0OiAnRUEnLFxuXHRcdFx0Y29udHJvbGxlcjogdXNlckN0cmwsXG5cdFx0XHRjb250cm9sbGVyQXM6ICd1Jyxcblx0XHRcdGJpbmRUb0NvbnRyb2xsZXI6IHRydWUsXG5cdFx0XHR0ZW1wbGF0ZTogJzxkaXYgbmctaWY9XCJ1LmlzQXV0aGVudGljYXRlZCgpICYmICEhdS51c2VyXCIgY2xhc3M9XCJ1c2VyIGNsZWFyZml4XCI+PGltZyBuZy1pZj1cIiEhdS51c2VyLnBpY3R1cmVcIiBuZy1zcmM9XCJ7e3UudXNlci5waWN0dXJlfX1cIiBjbGFzcz1cInVzZXItcGljdHVyZVwiIC8+PHNwYW4gY2xhc3M9XCJ1c2VyLWRpc3BsYXlOYW1lXCIgbmctYmluZD1cIjo6dS51c2VyLmRpc3BsYXlOYW1lXCI+PC9zcGFuPjwvZGl2Pidcblx0XHR9O1xuXHR9XG5cblx0dXNlckN0cmwuJGluamVjdCA9IFsnVXNlckRhdGEnLCAnVXRpbHMnXTtcblx0LyoqXG5cdCAqIFVzZXIgZGlyZWN0aXZlIGNvbnRyb2xsZXJcblx0ICovXG5cdGZ1bmN0aW9uIHVzZXJDdHJsKFVzZXJEYXRhLCBVdGlscykge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgdSA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0dS5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQvLyBBUEkgcmVxdWVzdCB0byBnZXQgdGhlIHVzZXIsIHBhc3Npbmcgc3VjY2VzcyBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHNldHMgdGhlIHVzZXIncyBpbmZvXG5cdFx0XHRyZXR1cm4gVXNlckRhdGEuZ2V0VXNlcigpLnRoZW4oX3VzZXJTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzZnVsIHVzZXIgcHJvbWlzZVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH1cblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91c2VyU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHR1LnVzZXIgPSBkYXRhO1xuXHRcdFx0cmV0dXJuIHUudXNlcjtcblx0XHR9XG5cdH1cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cdCd1c2Ugc3RyaWN0JztcclxuXHJcblx0YW5ndWxhclxyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcclxuXHRcdC5jb250cm9sbGVyKCdIZWFkZXJDdHJsJywgaGVhZGVyQ3RybCk7XHJcblxyXG5cdGhlYWRlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdMb2NhbERhdGEnLCAnJGF1dGgnLCAnVXNlckRhdGEnLCAnVXRpbHMnXTtcclxuXHJcblx0ZnVuY3Rpb24gaGVhZGVyQ3RybCgkc2NvcGUsICRsb2NhdGlvbiwgTG9jYWxEYXRhLCAkYXV0aCwgVXNlckRhdGEsIFV0aWxzKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaGVhZGVyID0gdGhpcztcclxuXHJcblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXHJcblx0XHRoZWFkZXIubG9nb3V0ID0gX2xvZ291dDtcclxuXHRcdGhlYWRlci5pc0F1dGhlbnRpY2F0ZWQgPSBVdGlscy5pc0F1dGhlbnRpY2F0ZWQ7XHJcblx0XHRoZWFkZXIuaW5kZXhJc0FjdGl2ZSA9IF9pbmRleElzQWN0aXZlO1xyXG5cdFx0aGVhZGVyLm5hdklzQWN0aXZlID0gX25hdklzQWN0aXZlO1xyXG5cclxuXHRcdF9pbml0KCk7XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xyXG5cdFx0XHQvLyBjaGVjayBpZiB1c2VyIGlzIGFuIGFkbWluXHJcblx0XHRcdF9jaGVja1VzZXJBZG1pbigpO1xyXG5cclxuXHRcdFx0X2FjdGl2YXRlKCk7XHJcblxyXG5cdFx0XHQvLyBjaGVjayBpZiB1c2VyIGlzIGFuIGFkbWluIG9uIGxvY2F0aW9uIGNoYW5nZVxyXG5cdFx0XHQkc2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdWNjZXNzJywgX2NoZWNrVXNlckFkbWluKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIENvbnRyb2xsZXIgYWN0aXZhdGVcclxuXHRcdCAqIEdldCBKU09OIGRhdGFcclxuXHRcdCAqXHJcblx0XHQgKiBAcmV0dXJucyB7Kn1cclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9hY3RpdmF0ZSgpIHtcclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XHJcblxyXG5cdFx0XHRyZXR1cm4gTG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIFN1Y2Nlc3NmdWxseSByZXRyaWV2ZWQgbG9jYWwgZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEBwYXJhbSBkYXRhXHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbG9jYWxEYXRhU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5sb2NhbERhdGEgPSBkYXRhO1xyXG5cclxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xyXG5cclxuXHRcdFx0cmV0dXJuIGhlYWRlci5sb2NhbERhdGE7XHJcblx0XHR9XHJcblxyXG5cdFx0LyoqXHJcblx0XHQgKiBMb2cgdGhlIHVzZXIgb3V0IG9mIHdoYXRldmVyIGF1dGhlbnRpY2F0aW9uIHRoZXkndmUgc2lnbmVkIGluIHdpdGhcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2xvZ291dCgpIHtcclxuXHRcdFx0aGVhZGVyLmFkbWluVXNlciA9IHVuZGVmaW5lZDtcclxuXHRcdFx0JGF1dGgubG9nb3V0KCk7XHJcblx0XHRcdCRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElmIHVzZXIgaXMgYXV0aGVudGljYXRlZCBhbmQgYWRtaW5Vc2VyIGlzIHVuZGVmaW5lZCxcclxuXHRcdCAqIGdldCB0aGUgdXNlciBhbmQgc2V0IGFkbWluVXNlciBib29sZWFuLlxyXG5cdFx0ICpcclxuXHRcdCAqIERvIHRoaXMgb24gZmlyc3QgY29udHJvbGxlciBsb2FkIChpbml0LCByZWZyZXNoKVxyXG5cdFx0ICogYW5kIHN1YnNlcXVlbnQgbG9jYXRpb24gY2hhbmdlcyAoaWUsIGNhdGNoaW5nIGxvZ291dCwgbG9naW4sIGV0YykuXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2NoZWNrVXNlckFkbWluKCkge1xyXG5cdFx0XHQvLyBpZiB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQgYW5kIG5vdCBkZWZpbmVkIHlldCwgY2hlY2sgaWYgdGhleSdyZSBhbiBhZG1pblxyXG5cdFx0XHRpZiAoJGF1dGguaXNBdXRoZW50aWNhdGVkKCkgJiYgaGVhZGVyLmFkbWluVXNlciA9PT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdFx0VXNlckRhdGEuZ2V0VXNlcigpXHJcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbihkYXRhKSB7XHJcblx0XHRcdFx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIF9nZXRVc2VyU3VjY2VzcyhkYXRhKSB7XHJcblx0XHRcdGhlYWRlci5hZG1pblVzZXIgPSBkYXRhLmlzQWRtaW47XHJcblxyXG5cclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW0gd2hlbiAnLycgaW5kZXhcclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfaW5kZXhJc0FjdGl2ZShwYXRoKSB7XHJcblx0XHRcdC8vIHBhdGggc2hvdWxkIGJlICcvJ1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKSA9PT0gcGF0aDtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEN1cnJlbnRseSBhY3RpdmUgbmF2IGl0ZW1cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxyXG5cdFx0ICogQHJldHVybnMge2Jvb2xlYW59XHJcblx0XHQgKiBAcHJpdmF0ZVxyXG5cdFx0ICovXHJcblx0XHRmdW5jdGlvbiBfbmF2SXNBY3RpdmUocGF0aCkge1xyXG5cdFx0XHRyZXR1cm4gJGxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMCwgcGF0aC5sZW5ndGgpID09PSBwYXRoO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmRpcmVjdGl2ZSgnbmF2Q29udHJvbCcsIG5hdkNvbnRyb2wpO1xuXG5cdG5hdkNvbnRyb2wuJGluamVjdCA9IFsnJHdpbmRvdycsICdyZXNpemUnXTtcblxuXHRmdW5jdGlvbiBuYXZDb250cm9sKCR3aW5kb3csIHJlc2l6ZSkge1xuXHRcdC8vIHJldHVybiBkaXJlY3RpdmVcblx0XHRyZXR1cm4ge1xuXHRcdFx0cmVzdHJpY3Q6ICdFQScsXG5cdFx0XHRsaW5rOiBuYXZDb250cm9sTGlua1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBuYXZDb250cm9sIExJTksgZnVuY3Rpb25cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSAkc2NvcGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBuYXZDb250cm9sTGluaygkc2NvcGUpIHtcblx0XHRcdC8vIGRhdGEgbW9kZWxcblx0XHRcdCRzY29wZS5uYXYgPSB7fTtcblxuXHRcdFx0Ly8gcHJpdmF0ZSB2YXJpYWJsZXNcblx0XHRcdHZhciBfJGJvZHkgPSBhbmd1bGFyLmVsZW1lbnQoJ2JvZHknKTtcblx0XHRcdHZhciBfbGF5b3V0Q2FudmFzID0gXyRib2R5LmZpbmQoJy5sYXlvdXQtY2FudmFzJyk7XG5cdFx0XHR2YXIgX25hdk9wZW47XG5cblx0XHRcdF9pbml0KCk7XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFx0Ly8gaW5pdGlhbGl6ZSBkZWJvdW5jZWQgcmVzaXplXG5cdFx0XHRcdHZhciBfcnMgPSByZXNpemUuaW5pdCh7XG5cdFx0XHRcdFx0c2NvcGU6ICRzY29wZSxcblx0XHRcdFx0XHRyZXNpemVkRm46IF9yZXNpemVkLFxuXHRcdFx0XHRcdGRlYm91bmNlOiAxMDBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0JHNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3RhcnQnLCBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdlbnRlci1tb2JpbGUnLCBfZW50ZXJNb2JpbGUpO1xuXHRcdFx0XHQkc2NvcGUuJG9uKCdleGl0LW1vYmlsZScsIF9leGl0TW9iaWxlKTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBSZXNpemVkIHdpbmRvdyAoZGVib3VuY2VkKVxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9yZXNpemVkKCkge1xuXHRcdFx0XHRfbGF5b3V0Q2FudmFzLmNzcyh7XG5cdFx0XHRcdFx0bWluSGVpZ2h0OiAkd2luZG93LmlubmVySGVpZ2h0ICsgJ3B4J1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcGVuIG1vYmlsZSBuYXZpZ2F0aW9uXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX29wZW5OYXYoKSB7XG5cdFx0XHRcdF8kYm9keVxuXHRcdFx0XHRcdC5yZW1vdmVDbGFzcygnbmF2LWNsb3NlZCcpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtb3BlbicpO1xuXG5cdFx0XHRcdF9uYXZPcGVuID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDbG9zZSBtb2JpbGUgbmF2aWdhdGlvblxuXHRcdFx0ICpcblx0XHRcdCAqIEBwcml2YXRlXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIF9jbG9zZU5hdigpIHtcblx0XHRcdFx0XyRib2R5XG5cdFx0XHRcdFx0LnJlbW92ZUNsYXNzKCduYXYtb3BlbicpXG5cdFx0XHRcdFx0LmFkZENsYXNzKCduYXYtY2xvc2VkJyk7XG5cblx0XHRcdFx0X25hdk9wZW4gPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUb2dnbGUgbmF2IG9wZW4vY2xvc2VkXG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIHRvZ2dsZU5hdigpIHtcblx0XHRcdFx0aWYgKCFfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9vcGVuTmF2KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X2Nsb3NlTmF2KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXaGVuIGNoYW5naW5nIGxvY2F0aW9uLCBjbG9zZSB0aGUgbmF2IGlmIGl0J3Mgb3BlblxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBfJGxvY2F0aW9uQ2hhbmdlU3RhcnQoKSB7XG5cdFx0XHRcdGlmIChfbmF2T3Blbikge1xuXHRcdFx0XHRcdF9jbG9zZU5hdigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGVudGVyaW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogQ2xvc2UgbmF2IGFuZCBzZXQgdXAgbWVudSB0b2dnbGluZyBmdW5jdGlvbmFsaXR5XG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKG1xKSB7XG5cdFx0XHRcdF9jbG9zZU5hdigpO1xuXG5cdFx0XHRcdC8vIGJpbmQgZnVuY3Rpb24gdG8gdG9nZ2xlIG1vYmlsZSBuYXZpZ2F0aW9uIG9wZW4vY2xvc2VkXG5cdFx0XHRcdCRzY29wZS5uYXYudG9nZ2xlTmF2ID0gdG9nZ2xlTmF2O1xuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBleGl0aW5nIG1vYmlsZSBtZWRpYSBxdWVyeVxuXHRcdFx0ICogRGlzYWJsZSBtZW51IHRvZ2dsaW5nIGFuZCByZW1vdmUgYm9keSBjbGFzc2VzXG5cdFx0XHQgKlxuXHRcdFx0ICogQHByaXZhdGVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gX2V4aXRNb2JpbGUobXEpIHtcblx0XHRcdFx0Ly8gdW5iaW5kIGZ1bmN0aW9uIHRvIHRvZ2dsZSBtb2JpbGUgbmF2aWdhdGlvbiBvcGVuL2Nsb3NlZFxuXHRcdFx0XHQkc2NvcGUubmF2LnRvZ2dsZU5hdiA9IG51bGw7XG5cblx0XHRcdFx0XyRib2R5LnJlbW92ZUNsYXNzKCduYXYtY2xvc2VkIG5hdi1vcGVuJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0pKCk7IiwiKGZ1bmN0aW9uKCkge1xuXHQndXNlIHN0cmljdCc7XG5cblx0YW5ndWxhclxuXHRcdC5tb2R1bGUoJ3JlU3RhcnQtbWVhbicpXG5cdFx0LmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgQWNjb3VudEN0cmwpO1xuXG5cdEFjY291bnRDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckYXV0aCcsICdVdGlscycsICdVc2VyRGF0YScsICckdGltZW91dCcsICdPQVVUSCcsICdVc2VyJywgJ1BhZ2UnXTtcblxuXHRmdW5jdGlvbiBBY2NvdW50Q3RybCgkc2NvcGUsICRhdXRoLCBVdGlscywgVXNlckRhdGEsICR0aW1lb3V0LCBPQVVUSCwgVXNlciwgUGFnZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgYWNjb3VudCA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0YWNjb3VudC50aXRsZSA9ICdNeSBBY2NvdW50Jztcblx0XHRhY2NvdW50LmxvZ2lucyA9IE9BVVRILkxPR0lOUzsgIC8vIEFsbCBhdmFpbGFibGUgbG9naW4gc2VydmljZXNcblx0XHRhY2NvdW50LmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblx0XHRhY2NvdW50LmdldFByb2ZpbGUgPSBfZ2V0UHJvZmlsZTtcblx0XHRhY2NvdW50LnVwZGF0ZVByb2ZpbGUgPSBfdXBkYXRlUHJvZmlsZTtcblx0XHRhY2NvdW50LmxpbmsgPSBfbGluaztcblx0XHRhY2NvdW50LnVubGluayA9IF91bmxpbms7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHRQYWdlLnNldFRpdGxlKGFjY291bnQudGl0bGUpO1xuXG5cdFx0XHRfYnRuU2F2ZVJlc2V0KCk7XG5cblx0XHRcdC8vIHdhdGNoIGZvciBkaXNwbGF5IG5hbWUgdXBkYXRlc1xuXHRcdFx0JHNjb3BlLiR3YXRjaCgnYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lJywgXyR3YXRjaERpc3BsYXlOYW1lKTtcblxuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxuXHRcdCAqIEdldCBKU09OIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHsqfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0cmV0dXJuIF9nZXRQcm9maWxlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogR2V0IHVzZXIncyBwcm9maWxlIGluZm9ybWF0aW9uXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFByb2ZpbGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblx0XHRcdHJldHVybiBVc2VyRGF0YS5nZXRVc2VyKCkudGhlbihfZ2V0VXNlclN1Y2Nlc3MsIF9nZXRVc2VyRXJyb3IpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZ1bmN0aW9uIGZvciBzdWNjZXNzZnVsIEFQSSBjYWxsIGdldHRpbmcgdXNlcidzIHByb2ZpbGUgZGF0YVxuXHRcdCAqIFNob3cgQWNjb3VudCBVSVxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIGRhdGEge29iamVjdH0gcHJvbWlzZSBwcm92aWRlZCBieSAkaHR0cCBzdWNjZXNzXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfZ2V0VXNlclN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0YWNjb3VudC51c2VyID0gZGF0YTtcblx0XHRcdGFjY291bnQuYWRtaW5pc3RyYXRvciA9IGFjY291bnQudXNlci5pc0FkbWluO1xuXHRcdFx0YWNjb3VudC5saW5rZWRBY2NvdW50cyA9IFVzZXIuZ2V0TGlua2VkQWNjb3VudHMoYWNjb3VudC51c2VyLCAnYWNjb3VudCcpO1xuXHRcdFx0YWNjb3VudC5zaG93QWNjb3VudCA9IHRydWU7XG5cblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiBmb3IgZXJyb3IgQVBJIGNhbGwgZ2V0dGluZyB1c2VyJ3MgcHJvZmlsZSBkYXRhXG5cdFx0ICogU2hvdyBhbiBlcnJvciBhbGVydCBpbiB0aGUgVUlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBlcnJvclxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldFVzZXJFcnJvcihlcnJvcikge1xuXHRcdFx0YWNjb3VudC5lcnJvckdldHRpbmdVc2VyID0gdHJ1ZTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IHByb2ZpbGUgc2F2ZSBidXR0b24gdG8gaW5pdGlhbCBzdGF0ZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYnRuU2F2ZVJlc2V0KCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IGZhbHNlO1xuXHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZlJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBXYXRjaCBkaXNwbGF5IG5hbWUgY2hhbmdlcyB0byBjaGVjayBmb3IgZW1wdHkgb3IgbnVsbCBzdHJpbmdcblx0XHQgKiBTZXQgYnV0dG9uIHRleHQgYWNjb3JkaW5nbHlcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBuZXdWYWwge3N0cmluZ30gdXBkYXRlZCBkaXNwbGF5TmFtZSB2YWx1ZSBmcm9tIGlucHV0IGZpZWxkXG5cdFx0ICogQHBhcmFtIG9sZFZhbCB7Kn0gcHJldmlvdXMgZGlzcGxheU5hbWUgdmFsdWVcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF8kd2F0Y2hEaXNwbGF5TmFtZShuZXdWYWwsIG9sZFZhbCkge1xuXHRcdFx0aWYgKG5ld1ZhbCA9PT0gJycgfHwgbmV3VmFsID09PSBudWxsKSB7XG5cdFx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRW50ZXIgTmFtZSc7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmUnO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFVwZGF0ZSB1c2VyJ3MgcHJvZmlsZSBpbmZvcm1hdGlvblxuXHRcdCAqIENhbGxlZCBvbiBzdWJtaXNzaW9uIG9mIHVwZGF0ZSBmb3JtXG5cdFx0ICovXG5cdFx0IGZ1bmN0aW9uIF91cGRhdGVQcm9maWxlKCkge1xuXHRcdFx0dmFyIHByb2ZpbGVEYXRhID0geyBkaXNwbGF5TmFtZTogYWNjb3VudC51c2VyLmRpc3BsYXlOYW1lIH07XG5cblx0XHRcdGlmICghIWFjY291bnQudXNlci5kaXNwbGF5TmFtZSkge1xuXHRcdFx0XHQvLyBTZXQgc3RhdHVzIHRvIFNhdmluZy4uLiBhbmQgdXBkYXRlIHVwb24gc3VjY2VzcyBvciBlcnJvciBpbiBjYWxsYmFja3Ncblx0XHRcdFx0YWNjb3VudC5idG5TYXZlVGV4dCA9ICdTYXZpbmcuLi4nO1xuXG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgdXNlciwgcGFzc2luZyBwcm9maWxlIGRhdGEgYW5kIGFzc2lnbmluZyBzdWNjZXNzIGFuZCBlcnJvciBjYWxsYmFja3Ncblx0XHRcdFx0VXNlckRhdGEudXBkYXRlVXNlcihwcm9maWxlRGF0YSkudGhlbihfdXBkYXRlU3VjY2VzcywgX3VwZGF0ZUVycm9yKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBTdWNjZXNzIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSBoYXMgYmVlbiB1cGRhdGVkXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91cGRhdGVTdWNjZXNzKCkge1xuXHRcdFx0YWNjb3VudC5idG5TYXZlZCA9IHRydWU7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVUZXh0ID0gJ1NhdmVkISc7XG5cblx0XHRcdCR0aW1lb3V0KF9idG5TYXZlUmVzZXQsIDI1MDApO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEVycm9yIGNhbGxiYWNrIHdoZW4gcHJvZmlsZSB1cGRhdGUgaGFzIGZhaWxlZFxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfdXBkYXRlRXJyb3IoKSB7XG5cdFx0XHRhY2NvdW50LmJ0blNhdmVkID0gJ2Vycm9yJztcblx0XHRcdGFjY291bnQuYnRuU2F2ZVRleHQgPSAnRXJyb3Igc2F2aW5nISc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTGluayB0aGlyZC1wYXJ0eSBwcm92aWRlclxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3ZpZGVyXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xpbmsocHJvdmlkZXIpIHtcblx0XHRcdHJldHVybiAkYXV0aC5saW5rKHByb3ZpZGVyKVxuXHRcdFx0XHQudGhlbihhY2NvdW50LmdldFByb2ZpbGUpXG5cdFx0XHRcdC5jYXRjaChfbGlua0NhdGNoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBMaW5rIHByb21pc2UgY2F0Y2hcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xpbmtDYXRjaChyZXNwb25zZSkge1xuXHRcdFx0YWxlcnQocmVzcG9uc2UuZGF0YS5tZXNzYWdlKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBVbmxpbmsgdGhpcmQtcGFydHkgcHJvdmlkZXJcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm92aWRlclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF91bmxpbmsocHJvdmlkZXIpIHtcblx0XHRcdHJldHVybiAkYXV0aC51bmxpbmsocHJvdmlkZXIpXG5cdFx0XHRcdC50aGVuKGFjY291bnQuZ2V0UHJvZmlsZSlcblx0XHRcdFx0LmNhdGNoKF91bmxpbmtDYXRjaCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogVW5saW5rIHByb21pc2UgY2F0Y2hcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX3VubGlua0NhdGNoKHJlc3BvbnNlKSB7XG5cdFx0XHRhbGVydChyZXNwb25zZS5kYXRhID8gcmVzcG9uc2UuZGF0YS5tZXNzYWdlIDogJ0NvdWxkIG5vdCB1bmxpbmsgJyArIHByb3ZpZGVyICsgJyBhY2NvdW50Jyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb250cm9sbGVyKCdBZG1pbkN0cmwnLCBBZG1pbkN0cmwpO1xuXG5cdEFkbWluQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVXRpbHMnLCAnVXNlckRhdGEnLCAnVXNlcicsICdQYWdlJ107XG5cblx0ZnVuY3Rpb24gQWRtaW5DdHJsKCRzY29wZSwgVXRpbHMsIFVzZXJEYXRhLCBVc2VyLCBQYWdlKSB7XG5cdFx0Ly8gY29udHJvbGxlckFzIFZpZXdNb2RlbFxuXHRcdHZhciBhZG1pbiA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0YWRtaW4udGl0bGUgPSAnQWRtaW4nO1xuXHRcdGFkbWluLmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcblxuXHRcdF9pbml0KCk7XG5cblx0XHQvKipcblx0XHQgKiBJTklUIGZ1bmN0aW9uIGV4ZWN1dGVzIHByb2NlZHVyYWwgY29kZVxuXHRcdCAqXG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfaW5pdCgpIHtcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoYWRtaW4udGl0bGUpO1xuXG5cdFx0XHRfYWN0aXZhdGUoKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDb250cm9sbGVyIGFjdGl2YXRlXG5cdFx0ICogR2V0IEpTT04gZGF0YVxuXHRcdCAqXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICogQHByaXZhdGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBfYWN0aXZhdGUoKSB7XG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcblxuXHRcdFx0cmV0dXJuIFVzZXJEYXRhLmdldEFsbFVzZXJzKCkudGhlbihfZ2V0QWxsVXNlcnNTdWNjZXNzLCBfZ2V0QWxsVXNlcnNFcnJvcik7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHN1Y2Nlc3NmdWwgQVBJIGNhbGwgZ2V0dGluZyB1c2VyIGxpc3Rcblx0XHQgKiBTaG93IEFkbWluIFVJXG5cdFx0ICogRGlzcGxheSBsaXN0IG9mIHVzZXJzXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IHByb21pc2UgcHJvdmlkZWQgYnkgJGh0dHAgc3VjY2Vzc1xuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzU3VjY2VzcyhkYXRhKSB7XG5cdFx0XHRhZG1pbi51c2VycyA9IGRhdGE7XG5cblx0XHRcdGFuZ3VsYXIuZm9yRWFjaChhZG1pbi51c2VycywgZnVuY3Rpb24odXNlcikge1xuXHRcdFx0XHR1c2VyLmxpbmtlZEFjY291bnRzID0gVXNlci5nZXRMaW5rZWRBY2NvdW50cyh1c2VyKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRhZG1pbi5zaG93QWRtaW4gPSB0cnVlO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogRnVuY3Rpb24gZm9yIHVuc3VjY2Vzc2Z1bCBBUEkgY2FsbCBnZXR0aW5nIHVzZXIgbGlzdFxuXHRcdCAqIFNob3cgVW5hdXRob3JpemVkIGVycm9yXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gZXJyb3Ige2Vycm9yfSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2dldEFsbFVzZXJzRXJyb3IoZXJyb3IpIHtcblx0XHRcdGFkbWluLnNob3dBZG1pbiA9IGZhbHNlO1xuXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb2ZmJyk7XG5cdFx0fVxuXHR9XG59KSgpOyIsIihmdW5jdGlvbigpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGFuZ3VsYXJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxuXHRcdC5jb250cm9sbGVyKCdFcnJvcjQwNEN0cmwnLCBFcnJvcjQwNEN0cmwpO1xuXG5cdEVycm9yNDA0Q3RybC4kaW5qZWN0ID0gWydQYWdlJ107XG5cblx0ZnVuY3Rpb24gRXJyb3I0MDRDdHJsKFBhZ2UpIHtcblx0XHR2YXIgZTQwNCA9IHRoaXM7XG5cblx0XHQvLyBiaW5kYWJsZSBtZW1iZXJzXG5cdFx0ZTQwNC50aXRsZSA9ICc0MDQgLSBQYWdlIE5vdCBGb3VuZCc7XG5cblx0XHRfaW5pdCgpO1xuXG5cdFx0LyoqXG5cdFx0ICogSU5JVCBmdW5jdGlvbiBleGVjdXRlcyBwcm9jZWR1cmFsIGNvZGVcblx0XHQgKlxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XG5cdFx0XHQvLyBzZXQgcGFnZSA8dGl0bGU+XG5cdFx0XHRQYWdlLnNldFRpdGxlKGU0MDQudGl0bGUpO1xuXHRcdH1cblx0fVxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XHJcblx0J3VzZSBzdHJpY3QnO1xyXG5cclxuXHRhbmd1bGFyXHJcblx0XHQubW9kdWxlKCdyZVN0YXJ0LW1lYW4nKVxyXG5cdFx0LmNvbnRyb2xsZXIoJ0hvbWVDdHJsJywgSG9tZUN0cmwpO1xyXG5cclxuXHRIb21lQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVXRpbHMnLCAnTG9jYWxEYXRhJywgJ1BhZ2UnXTtcclxuXHJcblx0ZnVuY3Rpb24gSG9tZUN0cmwoJHNjb3BlLCBVdGlscywgTG9jYWxEYXRhLCBQYWdlKSB7XHJcblx0XHQvLyBjb250cm9sbGVyQXMgVmlld01vZGVsXHJcblx0XHR2YXIgaG9tZSA9IHRoaXM7XHJcblxyXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xyXG5cdFx0aG9tZS5zdHJpbmdPZkhUTUwgPSAnPHN0cm9uZz5Tb21lIGJvbGQgdGV4dDwvc3Ryb25nPiBib3VuZCBhcyBIVE1MIHdpdGggYSA8YSBocmVmPVwiI1wiPmxpbms8L2E+ISc7XHJcblx0XHRob21lLmlzQXV0aGVudGljYXRlZCA9IFV0aWxzLmlzQXV0aGVudGljYXRlZDtcclxuXHRcdGhvbWUudmlld2Zvcm1hdCA9IG51bGw7XHJcblx0XHRob21lLmxvY2FsRGF0YSA9IG51bGw7XHJcblxyXG5cdFx0X2luaXQoKTtcclxuXHJcblx0XHQvKipcclxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2luaXQoKSB7XHJcblx0XHRcdFBhZ2Uuc2V0VGl0bGUoJ0hvbWUnKTtcclxuXHJcblx0XHRcdF9hY3RpdmF0ZSgpO1xyXG5cclxuXHRcdFx0Ly8gc2V0dXAgbWVkaWFxdWVyeSBmdW5jdGlvbnMgZGVmaW5pbmcgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHRcdCRzY29wZS4kb24oJ2VudGVyLW1vYmlsZScsIF9lbnRlck1vYmlsZSk7XHJcblx0XHRcdCRzY29wZS4kb24oJ2V4aXQtbW9iaWxlJywgX2V4aXRNb2JpbGUpO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxyXG5cdFx0ICogR2V0IEpTT04gZGF0YVxyXG5cdFx0ICpcclxuXHRcdCAqIEByZXR1cm5zIHsqfVxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xyXG5cdFx0XHQkc2NvcGUuJGVtaXQoJ2xvYWRpbmctb24nKTtcclxuXHJcblx0XHRcdC8vIGdldCBsb2NhbCBkYXRhIGFuZCByZXR1cm4gcHJvbWlzZVxyXG5cdFx0XHRyZXR1cm4gTG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEdldCBsb2NhbCBkYXRhIGZyb20gc3RhdGljIEpTT05cclxuXHRcdCAqXHJcblx0XHQgKiBAcGFyYW0gZGF0YSAoc3VjY2Vzc2Z1bCBwcm9taXNlIHJldHVybnMpXHJcblx0XHQgKiBAcmV0dXJucyB7b2JqZWN0fSBkYXRhXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9sb2NhbERhdGFTdWNjZXNzKGRhdGEpIHtcclxuXHRcdFx0aG9tZS5sb2NhbERhdGEgPSBkYXRhO1xyXG5cclxuXHRcdFx0Ly8gc3RvcCBsb2FkaW5nXHJcblx0XHRcdCRzY29wZS4kZW1pdCgnbG9hZGluZy1vZmYnKTtcclxuXHJcblx0XHRcdHJldHVybiBob21lLmxvY2FsRGF0YTtcclxuXHRcdH1cclxuXHJcblx0XHQvKipcclxuXHRcdCAqIEVudGVyIHNtYWxsIG1xXHJcblx0XHQgKiBTZXQgaG9tZS52aWV3Zm9ybWF0XHJcblx0XHQgKlxyXG5cdFx0ICogQHByaXZhdGVcclxuXHRcdCAqL1xyXG5cdFx0ZnVuY3Rpb24gX2VudGVyTW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnc21hbGwnO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8qKlxyXG5cdFx0ICogRXhpdCBzbWFsbCBtcVxyXG5cdFx0ICogU2V0IGhvbWUudmlld2Zvcm1hdFxyXG5cdFx0ICpcclxuXHRcdCAqIEBwcml2YXRlXHJcblx0XHQgKi9cclxuXHRcdGZ1bmN0aW9uIF9leGl0TW9iaWxlKCkge1xyXG5cdFx0XHRob21lLnZpZXdmb3JtYXQgPSAnbGFyZ2UnO1xyXG5cdFx0fVxyXG5cdH1cclxufSkoKTsiLCIoZnVuY3Rpb24oKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHRhbmd1bGFyXG5cdFx0Lm1vZHVsZSgncmVTdGFydC1tZWFuJylcblx0XHQuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuXHRMb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRhdXRoJywgJ09BVVRIJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgJ0xvY2FsRGF0YScsICdQYWdlJ107XG5cblx0ZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJGF1dGgsIE9BVVRILCAkcm9vdFNjb3BlLCAkbG9jYXRpb24sIExvY2FsRGF0YSwgUGFnZSkge1xuXHRcdC8vIGNvbnRyb2xsZXJBcyBWaWV3TW9kZWxcblx0XHR2YXIgbG9naW4gPSB0aGlzO1xuXG5cdFx0Ly8gYmluZGFibGUgbWVtYmVyc1xuXHRcdGxvZ2luLmxvZ2lucyA9IE9BVVRILkxPR0lOUztcblx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblx0XHRsb2dpbi5hdXRoZW50aWNhdGUgPSBfYXV0aGVudGljYXRlO1xuXG5cdFx0X2luaXQoKTtcblxuXHRcdC8qKlxuXHRcdCAqIElOSVQgZnVuY3Rpb24gZXhlY3V0ZXMgcHJvY2VkdXJhbCBjb2RlXG5cdFx0ICpcblx0XHQgKiBAcHJpdmF0ZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9pbml0KCkge1xuXHRcdFx0UGFnZS5zZXRUaXRsZSgnTG9naW4nKTtcblxuXHRcdFx0X2FjdGl2YXRlKCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ29udHJvbGxlciBhY3RpdmF0ZVxuXHRcdCAqIEdldCBKU09OIGRhdGFcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHsqfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2FjdGl2YXRlKCkge1xuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9uJyk7XG5cblx0XHRcdC8vIGdldCBsb2NhbCBkYXRhXG5cdFx0XHRyZXR1cm4gTG9jYWxEYXRhLmdldEpTT04oKS50aGVuKF9sb2NhbERhdGFTdWNjZXNzKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBGdW5jdGlvbiB0byBydW4gd2hlbiBsb2NhbCBkYXRhIHN1Y2Nlc3NmdWxcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBkYXRhIHtKU09OfVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2xvY2FsRGF0YVN1Y2Nlc3MoZGF0YSkge1xuXHRcdFx0bG9naW4ubG9jYWxEYXRhID0gZGF0YTtcblxuXHRcdFx0JHNjb3BlLiRlbWl0KCdsb2FkaW5nLW9mZicpO1xuXG5cdFx0XHRyZXR1cm4gbG9naW4ubG9jYWxEYXRhO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEF1dGhlbnRpY2F0ZSB0aGUgdXNlciB2aWEgT2F1dGggd2l0aCB0aGUgc3BlY2lmaWVkIHByb3ZpZGVyXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvdmlkZXIgLSAodHdpdHRlciwgZmFjZWJvb2ssIGdpdGh1YiwgZ29vZ2xlKVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIF9hdXRoZW50aWNhdGUocHJvdmlkZXIpIHtcblx0XHRcdGxvZ2luLmxvZ2dpbmdJbiA9IHRydWU7XG5cblx0XHRcdCRhdXRoLmF1dGhlbnRpY2F0ZShwcm92aWRlcilcblx0XHRcdFx0LnRoZW4oX2F1dGhTdWNjZXNzKVxuXHRcdFx0XHQuY2F0Y2goX2F1dGhDYXRjaCk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcblx0XHQgKiBHbyB0byBpbml0aWFsbHkgaW50ZW5kZWQgYXV0aGVudGljYXRlZCBwYXRoXG5cdFx0ICpcblx0XHQgKiBAcGFyYW0gcmVzcG9uc2Uge29iamVjdH0gcHJvbWlzZSByZXNwb25zZVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2F1dGhTdWNjZXNzKHJlc3BvbnNlKSB7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSBmYWxzZTtcblxuXHRcdFx0aWYgKCRyb290U2NvcGUuYXV0aFBhdGgpIHtcblx0XHRcdFx0JGxvY2F0aW9uLnBhdGgoJHJvb3RTY29wZS5hdXRoUGF0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkbG9jYXRpb24ucGF0aCgnLycpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEZhaWx1cmUgYXV0aGVudGljYXRpbmdcblx0XHQgKlxuXHRcdCAqIEBwYXJhbSByZXNwb25zZSB7b2JqZWN0fVxuXHRcdCAqIEBwcml2YXRlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gX2F1dGhDYXRjaChyZXNwb25zZSkge1xuXHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSk7XG5cdFx0XHRsb2dpbi5sb2dnaW5nSW4gPSAnZXJyb3InO1xuXHRcdFx0bG9naW4ubG9naW5Nc2cgPSAnJ1xuXHRcdH1cblx0fVxufSkoKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=