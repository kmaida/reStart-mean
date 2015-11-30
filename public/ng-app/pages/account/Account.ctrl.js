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
		account.getProfile = getProfile;
		account.updateProfile = updateProfile;
		account.link = link;
		account.unlink = unlink;

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
			return getProfile();
		}

		/**
		 * Get user's profile information
		 */
		function getProfile() {
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
		 function updateProfile() {
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
		function link(provider) {
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
		function unlink(provider) {
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