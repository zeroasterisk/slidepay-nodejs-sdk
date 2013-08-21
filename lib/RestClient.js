/*@module RestClient

This module provides a lightweight JavaScript layer for the resources behind
the SlidePay API. It also manages retrieval and refreshing of tokens.
*/

// Dependencies
var request = require('request');

// Configuration
var	supervisorBase = 'https://supervisor.getcube.com:65532/rest.svcAPI/';

/*

The SlidePay REST API client
@constructor
@param {object} credentials - The credentials for requesting a token from the API.
	- @member {string} email
	- @member {string} password

@param {object} options (optional) - Optional configuration for the client

*/


function RestClient(credentials, options) {
	if(!credentials || !credentials.email || !credentials.password) {
		throw 'RestClient requires an email and password to be defined';
	}
	else {
		this.accountCredentials = credentials;
	}
}