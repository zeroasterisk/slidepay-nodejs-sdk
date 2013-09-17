/*
@module resources/settlement
SlidePay settlements and balances
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/settlement';

	// Instance functions
	function settlement(id) {
		return {
			read: generate(client, 'GET', baseResourceUrl + '/' + id),
			
		};
	}

	// List functions
	settlement.create = generate(client, 'POST', baseResourceUrl + '/manual');
	settlement.balance = generate(client, 'POST', baseResourceUrl + '/balance');
	settlement.search = generate(client, 'PUT', baseResourceUrl);

	return settlement;
};