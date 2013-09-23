var should		= require('chai').should(),
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
				.persist()
				.get('/rest.svc/API')
				.reply(200, {success: true});
			nock(RestClient.endpoint)
				.persist()
				.get('/rest.svc/API/error')
				.reply(400, {success: false});
		});

		it('should return a promise when no callback is passed in', function() {
			RestClient.request().should.respondTo('then');
		});

		it('should call a callback function if one is passed in', function(done) {
			RestClient.request(function() {
				done();
			});
		});

		it('should reject the promise when the success property isn\'t true', function(done) {
			RestClient.request({url: '/error'}).fail(function(err) {
				done();
			});
		});

	});

	describe('#login', function() {
		var supervisorBase = 'https://supervisor.getcube.com:65532';

		before(function() {
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
		nock.cleanAll();
	});
});