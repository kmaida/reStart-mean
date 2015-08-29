(function() {
	'use strict';

	angular
		.module('myApp')
		.factory('Page', Page);

	function Page() {
		var pageTitle = '';

		function title() {
			return pageTitle;
		}

		function setTitle(newTitle) {
			pageTitle = newTitle;
		}

		return {
			title: title,
			setTitle: setTitle
		}
	}
})();