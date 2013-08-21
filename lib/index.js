/*@module slidepay

A helper library for interacting with the SlidePay REST API
*/

var RestClient = require('./RestClient');

function initialize(credentials, options) {
	return new RestClient(credentials, options);
}

initialize.RestClient = RestClient;

module.exports = initializer;