/*@module RestClient

This module provides a lightweight JavaScript layer for the resources behind
the SlidePay API. It also manages retrieval and refreshing of tokens.
*/

// Dependencies
var request		= require('request'),
	Q			= require ('q'),
	_			= require('lodash'),
	packageInfo = require('../package.json');

// Configuration
var supervisorBase	= 'https://supervisor.getcube.com:65532',
	loginEndpoint	= '/login';

/*

The SlidePay REST API client
@constructor
@param {object} credentials
	- @member {string} email - must be paired with password
	- @member {string} password
	- @member {string} token
	- @member {string} apiKey
@param {object} options (optional) - Optional configuration for the client. Currently unused.

*/


function RestClient(credentials, options) {
	if (!credentials) {
		throw new Error('The SlidePay REST client requires either an email/password, token, or API key');
	}

	this.auth = credentials;
	this.endpoint = supervisorBase;

	var client = this;
	var resources = ['api_key', 'authorization', 'bank_account', 'merchant', 'payment', 'settlement'];
	resources.forEach(function(resource) {
		client[resource] = require('../resources/' + resource + '.js')(client);
	});
}

/*
Return the URL for requests (supervisor, dev, api)

@returns {string} - the base URL
*/

RestClient.prototype.baseUrl = function() {
	return this.endpoint + '/rest.svc/API';
};

/*
Perform a request against the SlidePay API using the request library. Pass
through options to its API to modify the requests.

https://github.com/mikeal/request

@param {object} options (optional) - HTTP request options
@param {function} callback (optional) - A callback function for when the requst completes
	- @param {object} error - An error if one occurred
	- @param {object} response - The full response from request
		- @member {object} body - The JSON parsed request body

@returns {object} - A promise if no callback is passed
*/

RestClient.prototype.request = function(options, callback) {
	var client = this;
	// If a function is passed in options, set the callback to that
	if (typeof options === 'function') {
		callback = options;
		options = {};
	}
	// If nothing is passed in, set default options
	options = options || {};
	options.url = options.url || '';
	options.headers = options.headers || {};

	// Require that a call be authenticated with either a token or API key by default
	if (typeof options.authRequired === 'undefined') {
		options.authRequired = true;
	}

	// Assume API key authentication if one is present, otherwise use a token.
	// Set options.authStrategy to override
	if (!options.authStrategy) {
		if (client.auth.apiKey) {
			options.authStrategy = 'apiKey';
		}
		else {
			options.authStrategy = 'token';
		}
	}

	// Set appropriate headers based on the authentication strategy
	if (options.authStrategy === 'apiKey') {
		options.headers['x-cube-api-key'] = client.auth.apiKey;
	}
	if (options.authStrategy === 'token') {
		options.headers['x-cube-token'] = client.auth.token;
	}

	// Set the URL to the base (which incorporates the current endpoint) and the path
	options.url = client.baseUrl() + options.url;
	options.headers = _.extend(options.headers, {
		'Accept': 'application/json',
		'User-Agent': 'slidepay-node/' + packageInfo.version,
	});

	var deferred = Q.defer();
	request(options, function(err, res, body) {
		if (err) {
			deferred.reject(err);
		}
		else {
			if (typeof res.body === 'string') {
				res.body = JSON.parse(res.body);
			}
			res.data = res.body.data;
			if (res.body.success) {
				// If the success property in the response body is true,
				// resolve the promise
				deferred.resolve(res);
			}
			else {
				// If success === false, construct an error and reject the promise
				err = new Error('SlidePay could not successfully complete the request');
				err.res = res;
				deferred.reject(err);
			}
		}
	});

	if (callback) {
		// If there's a callback, try to resolve the promise and call the cb
		deferred.promise.then(function(res) {
			// Promise resolved, so the 2nd arg (err) should be sent as null
			return callback.call(client, null, res);
		}, function(err) {
			// The promise rejected, so send the body as null
			return callback.call(client, err);
		});
	}
	else {
		// No callback was defined, so return a promise
		return deferred.promise;
	}
};

/*
Run a login request and write the token and endpoint when it completes

@param {function} callback (optional) - A callback for when login is complete
	- @param {object} err - An error object if the request failed

@returns {object} - A promise if no callback is passed in
*/

RestClient.prototype.login = function(callback) {
	var client = this;

	// Reset the endpoint to the supervisor
	client.endpoint = supervisorBase;

	// Set the login headers and make a request
	var loginPromise = client.request({
		url: loginEndpoint,
		authRequired: false,
		headers: {
			'x-cube-email': client.auth.email,
			'x-cube-password': client.auth.password
		}
	})
	.then(function(res) {
		client.auth.token = res.data;
		client.endpoint = res.body.endpoint;
	});

	if (callback) {
		loginPromise.then(function(res) {
			// Login succeeded, so set err = null
			return callback.call(client, null);
		}, function(err) {
			// Login failed, pass the error through
			return callback.call(client, err);
		});
	}
	else {
		// No callback, so return a promise
		return loginPromise;
	}

};

module.exports = RestClient;