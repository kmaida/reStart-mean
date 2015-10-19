// application $auth constants
(function() {
	'use strict';

	angular
		.module('myApp')
		.constant('APPAUTH', {
			LOGIN_URL: {
				PROD: 'http://[YOUR DOMAIN HERE]/auth/login',
				DEV: 'http://localhost:8081/auth/login'
			},
			CLIENTIDS: {
				// change these to your own
				FACEBOOK: '[YOUR FACEBOOK CLIENT ID]',
				GOOGLE: '[YOUR GOOGLE CLIENT ID]',
				GITHUB: '[YOUR GITHUB CLIENT ID]'
			}
		});
})();