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