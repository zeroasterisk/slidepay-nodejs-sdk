/*
@module resources/settlement
SlidePay settlements and balances
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/settlement';

	settlement = {
		create: generate(client, 'POST', baseResourceUrl + '/manual'),
		balance: generate(client, 'POST', baseResourceUrl + '/balance')
	};

	return settlement;
};