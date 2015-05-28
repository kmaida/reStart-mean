var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var qs = require('querystring');
var User = require('./models/User');

module.exports = function(app, config) {

	var _defaultPicture = '/assets/images/img-user.png';

	/**
	 * Set default display name to last 5 characters of ID
	 *
	 * @param id {object|string} ID
	 * @returns {string}
	 * @private
	 */
	function _defaultDisplayName(id) {
		var idStr = id.toString();
		return 'user' + idStr.substr(idStr.length - 5);
	}

	/*
	 |--------------------------------------------------------------------------
	 | Login Required Middleware
	 |--------------------------------------------------------------------------
	 */

	/**
	 * Make sure user is authenticated
	 *
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */
	function ensureAuthenticated(req, res, next) {
		if (!req.headers.authorization) {
			return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
		}
		var token = req.headers.authorization.split(' ')[1];

		var payload = null;
		try {
			payload = jwt.decode(token, config.TOKEN_SECRET);
		}
		catch (err){
			return res.status(401).send({message: err.message});
		}

		if (payload.exp <= moment().unix()) {
			return res.status(401).send({ message: 'Token has expired' });
		}
		req.user = payload.sub;
		next();
	}

	/**
	 * Make sure user is authenticated and is authorized as an administrator
	 *
	 * @param req
	 * @param res
	 * @param next
	 * @returns {*}
	 */
	function ensureAdmin(req, res, next) {
		if (!req.headers.authorization) {
			return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
		}
		var token = req.headers.authorization.split(' ')[1];

		var payload = null;
		try {
			payload = jwt.decode(token, config.TOKEN_SECRET);
		}
		catch (err){
			return res.status(401).send({message: err.message});
		}

		if (payload.exp <= moment().unix()) {
			return res.status(401).send({ message: 'Token has expired' });
		}
		req.user = payload.sub;
		req.isAdmin = payload.role;

		if (!req.isAdmin) {
			return res.status(401).send({ message: 'Not authorized' });
		}
		next();
	}

	/*
	 |--------------------------------------------------------------------------
	 | Generate JSON Web Token
	 |--------------------------------------------------------------------------
	 */

	/**
	 * Create JSON Web Token for authentication
	 *
	 * @param user
	 * @returns {*}
	 */
	function createJWT(user) {
		var payload = {
			sub: user._id,
			role: user.isAdmin,
			iat: moment().unix(),
			exp: moment().add(14, 'days').unix()
		};
		return jwt.encode(payload, config.TOKEN_SECRET);
	}

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/me
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (!user.displayName) {
				user.displayName = _defaultDisplayName(req.user);
			}
			if (!user.picture) {
				user.picture = _defaultPicture;
			}
			res.send(user);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | PUT /api/me
	 |--------------------------------------------------------------------------
	 */
	app.put('/api/me', ensureAuthenticated, function(req, res) {
		User.findById(req.user, function(err, user) {
			if (!user) {
				return res.status(400).send({ message: 'User not found' });
			}
			user.displayName = req.body.displayName || user.displayName || _defaultDisplayName(req.user);
			user.picture = user.picture || _defaultPicture;
			user.save(function(err) {
				res.status(200).end();
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | GET /api/users (authorize as admin)
	 |--------------------------------------------------------------------------
	 */
	app.get('/api/users', ensureAdmin, function(req, res) {
		User.find({}, function(err, users) {
			var userArr = [];
			users.forEach(function(user) {
				if (!user.displayName) {
					user.displayName = _defaultDisplayName(user._id);
				}
				if (!user.picture) {
					user.picture = _defaultPicture;
				}
				userArr.push(user);
			});
			res.send(userArr);
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Log in with Email
	 |--------------------------------------------------------------------------
	 */
	//app.post('/auth/login', function(req, res) {
	//	User.findOne({ email: req.body.email }, '+password', function(err, user) {
	//		if (!user) {
	//			return res.status(401).send({ message: 'Wrong email and/or password' });
	//		}
	//		user.comparePassword(req.body.password, function(err, isMatch) {
	//			if (!isMatch) {
	//				return res.status(401).send({ message: 'Wrong email and/or password' });
	//			}
	//			res.send({ token: createToken(user) });
	//		});
	//	});
	//});

	/*
	 |--------------------------------------------------------------------------
	 | Create Email and Password Account
	 |--------------------------------------------------------------------------
	 */
	//app.post('/auth/signup', function(req, res) {
	//	User.findOne({ email: req.body.email }, function(err, existingUser) {
	//		if (existingUser) {
	//			return res.status(409).send({ message: 'Email is already taken' });
	//		}
	//		var user = new User({
	//			displayName: req.body.displayName,
	//			email: req.body.email,
	//			password: req.body.password
	//		});
	//		user.save(function() {
	//			res.send({ token: createToken(user) });
	//		});
	//	});
	//});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Google
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/google', function(req, res) {
		var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
		var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.GOOGLE_SECRET,
			redirect_uri: req.body.redirectUri,
			grant_type: 'authorization_code'
		};

		// Step 1. Exchange authorization code for access token.
		request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
			var accessToken = token.access_token;
			var headers = { Authorization: 'Bearer ' + accessToken };

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {

				// Step 3a. Link user accounts.
				if (req.headers.authorization) {
					User.findOne({ google: profile.sub }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.google = profile.sub;
							user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200') || _defaultPicture;
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ google: profile.sub }, function(err, existingUser) {
						if (existingUser) {
							return res.send({ token: createJWT(existingUser) });
						}
						var user = new User();
						user.google = profile.sub;
						user.picture = profile.picture.replace('sz=50', 'sz=200');
						user.displayName = profile.name;

						// TODO: to create an admin user, allow one-time isAdmin = true in one of the account creations
						// user.isAdmin = true;

						user.save(function(err) {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with GitHub
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/github', function(req, res) {
		var accessTokenUrl = 'https://github.com/login/oauth/access_token';
		var userApiUrl = 'https://api.github.com/user';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.GITHUB_SECRET,
			redirect_uri: req.body.redirectUri
		};

		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
			accessToken = qs.parse(accessToken);
			var headers = { 'User-Agent': 'Satellizer' };

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

				// Step 3a. Link user accounts.
				if (req.headers.authorization) {
					User.findOne({ github: profile.id }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.github = profile.id;
							user.picture = user.picture || profile.avatar_url || _defaultPicture;
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ github: profile.id }, function(err, existingUser) {
						if (existingUser) {
							var token = createJWT(existingUser);
							return res.send({ token: token });
						}
						var user = new User();
						user.github = profile.id;
						user.picture = profile.avatar_url;
						user.displayName = profile.name;
						user.save(function() {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Facebook
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/facebook', function(req, res) {
		var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
		var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
		var params = {
			code: req.body.code,
			client_id: req.body.clientId,
			client_secret: config.FACEBOOK_SECRET,
			redirect_uri: req.body.redirectUri
		};

		// Step 1. Exchange authorization code for access token.
		request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
			if (response.statusCode !== 200) {
				return res.status(500).send({ message: accessToken.error.message });
			}

			// Step 2. Retrieve profile information about the current user.
			request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
				if (response.statusCode !== 200) {
					return res.status(500).send({ message: profile.error.message });
				}
				if (req.headers.authorization) {
					User.findOne({ facebook: profile.id }, function(err, existingUser) {
						if (existingUser) {
							return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
						}
						var token = req.headers.authorization.split(' ')[1];
						var payload = jwt.decode(token, config.TOKEN_SECRET);
						User.findById(payload.sub, function(err, user) {
							if (!user) {
								return res.status(400).send({ message: 'User not found' });
							}
							user.facebook = profile.id;
							user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
							user.displayName = user.displayName || profile.name;
							user.save(function() {
								var token = createJWT(user);
								res.send({ token: token });
							});
						});
					});
				} else {
					// Step 3b. Create a new user account or return an existing one.
					User.findOne({ facebook: profile.id }, function(err, existingUser) {
						if (existingUser) {
							var token = createJWT(existingUser);
							return res.send({ token: token });
						}
						var user = new User();
						user.facebook = profile.id;
						user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=small';
						user.displayName = profile.name;
						user.save(function() {
							var token = createJWT(user);
							res.send({ token: token });
						});
					});
				}
			});
		});
	});

	/*
	 |--------------------------------------------------------------------------
	 | Login with Twitter
	 |--------------------------------------------------------------------------
	 */
	app.post('/auth/twitter', function(req, res) {
		var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
		var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
		var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

		// Part 1 of 2: Initial request from Satellizer.
		if (!req.body.oauth_token || !req.body.oauth_verifier) {
			var requestTokenOauth = {
				consumer_key: config.TWITTER_KEY,
				consumer_secret: config.TWITTER_SECRET,
				callback: config.TWITTER_CALLBACK
			};

			// Step 1. Obtain request token for the authorization popup.
			request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
				var oauthToken = qs.parse(body);

				// Step 2. Send OAuth token back to open the authorization screen.
				res.send(oauthToken);
			});
		} else {
			// Part 2 of 2: Second request after Authorize app is clicked.
			var accessTokenOauth = {
				consumer_key: config.TWITTER_KEY,
				consumer_secret: config.TWITTER_SECRET,
				token: req.body.oauth_token,
				verifier: req.body.oauth_verifier
			};

			// Step 3. Exchange oauth token and oauth verifier for access token.
			request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

				accessToken = qs.parse(accessToken);

				var profileOauth = {
					consumer_key: config.TWITTER_KEY,
					consumer_secret: config.TWITTER_SECRET,
					oauth_token: accessToken.oauth_token
				};

				// Step 4. Retrieve profile information about the current user.
				request.get({ url: profileUrl + accessToken.screen_name, oauth: profileOauth, json: true }, function(err, response, profile) {

					// Step 5a. Link user accounts.
					if (req.headers.authorization) {
						User.findOne({ twitter: profile.id }, function(err, existingUser) {
							if (existingUser) {
								return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
							}

							var token = req.headers.authorization.split(' ')[1];
							var payload = jwt.decode(token, config.TOKEN_SECRET);

							User.findById(payload.sub, function(err, user) {
								if (!user) {
									return res.status(400).send({ message: 'User not found' });
								}

								user.twitter = profile.id;
								user.displayName = user.displayName || profile.name;
								user.picture = user.picture || profile.profile_image_url.replace('_normal', '') || _defaultPicture;
								user.save(function(err) {
									res.send({ token: createJWT(user) });
								});
							});
						});
					} else {
						// Step 5b. Create a new user account or return an existing one.
						User.findOne({ twitter: profile.id }, function(err, existingUser) {
							if (existingUser) {
								return res.send({ token: createJWT(existingUser) });
							}

							var user = new User();
							user.twitter = profile.id;
							user.displayName = profile.name;
							user.picture = profile.profile_image_url.replace('_normal', '');
							user.save(function() {
								res.send({ token: createJWT(user) });
							});
						});
					}
				});
			});
		}
	});

	/*
	 |--------------------------------------------------------------------------
	 | Unlink Provider
	 |--------------------------------------------------------------------------
	 */
	app.get('/auth/unlink/:provider', ensureAuthenticated, function(req, res) {
		var provider = req.params.provider;
		User.findById(req.user, function(err, user) {
			if (!user) {
				return res.status(400).send({ message: 'User not found' });
			}
			user[provider] = undefined;
			user.save(function() {
				res.status(200).end();
			});
		});
	});

};