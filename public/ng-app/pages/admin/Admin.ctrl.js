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