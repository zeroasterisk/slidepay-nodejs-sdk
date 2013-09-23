var _			= require('lodash'),
	slidepay	= require('../index.js'),
	credentials	= require('../credentials.json');

describe('A SlidePay payment', function() {
	var SlidePay = new slidepay.RestClient(credentials);
	// IMPORTANT: The SlidePay dev endpoint sometimes has long response times,
	// up to 5 seconds. Async tests will fail if they time out and 5000ms is
	// the minimum interval on a reliable connection to avoid timeouts.
	this.timeout(5000);

	before(function(done) {
		// Before running any tests, login
		SlidePay.login().then(function() {
			done();
		});
	});

	// A generic payment must have a method, amount, and expiration defined
	genericPayment = {
		method: 'CreditCard',
		amount: 1.00,
		cc_expiry_month: '12',
		cc_expiry_year: '2020'
	};

	// A keyed transaction must also have a billing ZIP to pass
	passingGenericPayment = _.extend(genericPayment, {
		cc_billing_zip: '11111'
	});

	// SlidePay test cards
	// https://getcube.atlassian.net/wiki/display/CDP/Test+Credit+Cards+and+Payment+Values
	var testCards = {
		'Visa': '4012888888881881',
		'MasterCard': '5454545454545454',
		'AmericanExpress': '371449635398456',
		'Discover': '6011000995504101'
	};

	// For each card...
	_.each(testCards, function(cardNumber, cardType) {
		it('should successfully process a ' + cardType + ' card', function() {

			simplePayment = _.extend(passingGenericPayment, {
				cc_number: cardNumber
			});

			// The create promise should be fulfilled, indicating the resource
			// was successfully created
			return SlidePay.payment.create(simplePayment).should.be.fulfilled;
		});
	});

	it('should accept 111 as a CVV2', function() {
		// Allowed test values for the CVV2 are null and '111'
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_cvv2: '111'
		});

		return SlidePay.payment.create(simplePayment).should.be.fulfilled;
	});

	it('should reject any CVV2 that is not 111', function() {
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_cvv2: '222'
		});

		return SlidePay.payment.create(simplePayment).should.be.rejected;
	});

	it('should reject any billing ZIP that is not 11111', function() {
		// The allowed test ZIP value is 11111
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_billing_zip: '22222'
		});

		return SlidePay.payment.create(simplePayment).should.be.rejected;
	});
});