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
			read: generate(client, 'GET', baseResourceUrl + '/' + id),
			delete: generate(client, 'DELETE', baseResourceUrl + '/' + id)
		};
	}

	// List functions
	api_key.create = generate(client, 'POST', baseResourceUrl);
	api_key.list = generate(client, 'GET', baseResourceUrl);

	return api_key;
};