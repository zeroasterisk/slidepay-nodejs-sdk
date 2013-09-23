var nock		= require('nock'),
	slidepay	= require('../index.js'),
	credentials	= require('../credentials.json');

describe('The SlidePay REST Client', function () {
	it('should throw an error if a credentials object is not provided', function () {
		should.Throw(slidepay);
	});

	var RestClient = new slidepay.RestClient(credentials);

	describe('#request', function() {
		// Before we execute the request method tests, set up a mock server
		// that simulates the response of SlidePay's API
		before(function() {
			nock(RestClient.endpoint)
				.persist()
				.get('/rest.svc/API')
				.reply(200, {success: true});
			nock(RestClient.endpoint)
				.persist()
				.get('/rest.svc/API/error')
				.reply(400, {success: false});
		});

		it('should return a promise when no callback is passed in', function() {
			// Promises have a then method, so we check if one is defined
			RestClient.request().should.respondTo('then');
		});

		it('should call a callback function if one is passed in', function(done) {
			// Pass a callback as argument #1 to request. It should be called.
			RestClient.request(function() {
				done();
			});
		});

		it('should reject the promise when the success property isn\'t true', function(done) {
			return RestClient.request({url: '/error'}).should.be.rejected;
		});

	});

	describe('#login', function() {
		var supervisorBase = 'https://supervisor.getcube.com:65532';

		before(function(done) {
			// Before we test the login behavior, set up a mock server that
			// responds with a dummy token, an endpoint, and the right
			// headers. The tests will only be run once login succeeds.
			nock(supervisorBase)
				.get('/rest.svc/API/login')
				.reply(200, {success: true, data: 'SlidePayToken', endpoint: 'https://api.getcube.com'});

			RestClient.login().then(function() {
				done();
			});
		});

		it('should set a token', function() {
			RestClient.auth.should.have.a.property('token').that.is.eq('SlidePayToken');
		});

		it('should overwrite the endpoint', function() {
			RestClient.should.have.a.property('endpoint').that.is.eq('https://api.getcube.com');
		});
	});

	after(function() {
		// Clean up the mock server
		nock.cleanAll();
	});
});