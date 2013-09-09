/*
@module resources/api_key
SlidePay API keys
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/api_key';

	// Instance functions
	function api_key(id) {
		return {
			get: generate(client, 'GET', baseResourceUrl + '/' + id),
			delete: generate(client, 'DELETE', baseResourceUrl + '/' + id)
		};
	}

	// List functions
	api_key.post = generate(client, 'POST', baseResourceUrl);
	api_key.get = generate(client, 'GET', baseResourceUrl);

	return api_key;
};