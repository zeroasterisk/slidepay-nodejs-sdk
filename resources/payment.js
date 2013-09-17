/*
@module resources/payment
SlidePay simple and stored payments
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/payment';

	// Instance functions
	function payment(id) {
		return {
			read: generate(client, 'GET', baseResourceUrl + '/' + id),
			refund: generate(client, 'POST', baseResourceUrl + '/refund/' + id)
		};
	}

	// List functions
	payment.create = generate(client, 'POST', baseResourceUrl + '/simple');
	payment.store = generate(client, 'POST', '/stored_payment');
	payment.search = generate(client, 'PUT', baseResourceUrl);

	return payment;
};