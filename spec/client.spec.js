var should		= require('chai').should(),
	sinon		= require('sinon'),
	slidepay	= require('../index.js'),
	credentials	= require('../credentials.json');

describe('The SlidePay REST Client', function () {
	it('should throw an error if a credentials object is not provided', function () {
		should.Throw(slidepay);
	});

	var RestClient = new slidepay.RestClient(credentials);

	describe('#request', function() {
		it('should return a promise when no callback is passed in', function() {
			RestClient.request().should.respondTo('then');
		});
		it('should call a callback function if one is passed in', function(done) {
			RestClient.request(function() {
				done();
			});
		});
	});

	describe('#login', function() {
		RestClient.login();
	});
});