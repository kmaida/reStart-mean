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
			_activate();
		}

		/**
		 * INIT function executes procedural code
		 *
		 * @private
		 */
		function _activate() {
			// API request to get the user, passing success callback function that sets the user's info
			return userData.getUser().then(_userSuccess);
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
			return u.user;
		}
	}
})();