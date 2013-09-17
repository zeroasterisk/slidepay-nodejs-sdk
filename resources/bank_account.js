/*
@module resources/bank_account
SlidePay stored bank account details
*/

var generate = require('./generate');

module.exports = function(client) {
	var baseResourceUrl = '/bank_account';

	// Instance functions
	function bankAccount(id) {
		return {
			read: generate(client, 'GET', baseResourceUrl + '/' + id),
			delete: generate(client, 'DELETE', baseResourceUrl + '/' + id),
		};
	}

	// List functions
	bankAccount.create = generate(client, 'POST', baseResourceUrl);

	return bankAccount;
};