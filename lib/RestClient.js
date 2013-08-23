/*@module RestClient

This module provides a lightweight JavaScript layer for the resources behind
the SlidePay API. It also manages retrieval and refreshing of tokens.
*/

// Dependencies
var request		= require('request'),
	Q			= require ('q'),
	_			= require('underscore'),
	packageInfo = require('../package.json');

// Configuration
var supervisorBase	= 'https://supervisor.getcube.com:65532',
	loginEndpoint	= '/login';

/*

The SlidePay REST API client
@constructor
@param {object} credentials - The credentials for requesting a token from the API.
	- @member {string} email
	- @member {string} password
@param {object} options (optional) - Optional configuration for the client

*/


function RestClient(credentials, options) {
	if (!credentials || !credentials.email || !credentials.password) {
		throw new Error('RestClient requires an email and password to be defined');
	}

	// Set up objects and defaults
	this.auth = {};
	this.auth.credentials = credentials;
	this.auth.session = {};
	this.auth.session.endpoint = supervisorBase;
}

/*
Return the URL for requests (supervisor, dev, api)

@returns {string} - the base URL
*/

RestClient.prototype.baseUrl = function() {
	return this.auth.session.endpoint + '/rest.svc/API';
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

	options.authRequired = options.authRequired || true;

	// Create a token variable for convenience
	var token = client.auth.session.token;

	if (options.authRequired) {
		options.headers['x-cube-token'] = token;
	}

	options.url = client.baseUrl() + options.url;
	options.headers = _.extend({
		'Accept': 'application/json',
		'User-Agent': 'slidepay-node/' + packageInfo.version,
	}, options.headers);

	var deferred = Q.defer();
	request(options, function(err, res, body) {
		if (err) {
			deferred.reject(err);
		}
		else {
			res.body = JSON.parse(res.body);
			deferred.resolve(res);
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
	client.auth.session.endpoint = supervisorBase;

	// Set the login headers and make a request
	var loginPromise = client.request({
		url: loginEndpoint,
		authRequired: false,
		headers: {
			'x-cube-email': client.auth.credentials.email,
			'x-cube-password': client.auth.credentials.password
		}
	})
	.then(function(res) {
		client.auth.session = {
			token: res.body.data,
			endpoint: res.body.endpoint
		};
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

/*
A helper function for checking whether there is an active session

@returns {boolean}
*/

RestClient.prototype.isLoggedIn = function() {
	// If there's an active session then we're logged in
	return this.auth.session ? true : false;
};

module.exports = RestClient;