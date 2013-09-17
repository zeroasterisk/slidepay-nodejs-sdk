/*
@module resources/merchant
SlidePay account creation and boarding
*/

var generate = require('./generate');

module.exports = function(client) {
	baseResourceUrl = '/boarding';

	merchant = {
		createAccount: generate(client, 'POST', '/create_account', false),
		boarding: {
			createApplication: generate(client, 'POST', baseResourceUrl + '/create_application'),
			submitAnswers: generate(client, 'POST', baseResourceUrl + '/submit_answers')
		}
	};

	return merchant;
};