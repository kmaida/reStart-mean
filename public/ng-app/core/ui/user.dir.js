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
}());