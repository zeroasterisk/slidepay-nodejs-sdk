/*
@module resources/authorization
SlidePay simple and manual authorization and capture
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/authorization';

	// Instance functions
	function authorization(id) {
		return {
			void: generate(client, 'POST', baseResourceUrl + '/void/' + id),
			capture: {
				auto: generate(client, 'POST', '/capture/auto' + id),
				manual: generate(client, 'POST', '/capture/manual' + id)
			}
		};
	}

	// List functions
	authorization.create = generate(client, 'POST', baseResourceUrl + '/simple');

	return authorization;
};