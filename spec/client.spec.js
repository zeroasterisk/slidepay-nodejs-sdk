var should		= require('chai').should(),
	sinon		= require('sinon'),
	nock		= require('nock'),
	slidepay	= require('../index.js'),
	credentials	= require('../credentials.json');

describe('The SlidePay REST Client', function () {
	it('should throw an error if a credentials object is not provided', function () {
		should.Throw(slidepay);
	});

	var RestClient = new slidepay.RestClient(credentials);

	describe('#request', function() {

		before(function() {
			nock(RestClient.endpoint)
				.get('/rest.svc/API')
				.reply(200, {});
		});

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
		before(function() {
			nock(RestClient.auth.session.endpoint)
				.get('/rest.svc/API/login')
				.reply(200, {token: 'token', endpoint: 'endpoint'});
		});

		RestClient.login();
	});

	after(function() {
		nock.cleanAll();
	});
});