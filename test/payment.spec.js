var _			= require('lodash'),
	should		= require('chai').should(),
	slidepay	= require('../index.js'),
	credentials	= require('../credentials.json');

describe('A SlidePay payment', function() {
	var SlidePay = new slidepay.RestClient(credentials);
	this.timeout(5000);

	before(function(done) {
		SlidePay.login().then(function() {
			done();
		});
	});

	genericPayment = {
		method: 'CreditCard',
		amount: 1.00,
		cc_expiry_month: '12',
		cc_expiry_year: '2020'
	};

	passingGenericPayment = _.extend(genericPayment, {
		cc_billing_zip: '11111'
	});

	var testCards = {
		'Visa': '4012888888881881',
		'MasterCard': '5454545454545454',
		'AmericanExpress': '371449635398456',
		'Discover': '6011000995504101'
	};

	_.each(testCards, function(cardNumber, cardType) {
		it('should successfully process a ' + cardType + ' card', function() {

			simplePayment = _.extend(passingGenericPayment, {
				cc_number: cardNumber
			});

			return SlidePay.payment.create(simplePayment).should.be.fulfilled;
		});
	});

	it('should accept 111 as a CVV2', function(done) {
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_cvv2: '111'
		});

		return SlidePay.payment.create(simplePayment).should.be.fulfilled;
	});

	it('should reject any CVV2 that is not 111', function(done) {
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_cvv2: '222'
		});

		return SlidePay.payment.create(simplePayment).should.be.rejected;
	});

	it('should reject any billing ZIP that is not 11111', function(done) {
		simplePayment = _.extend(passingGenericPayment, {
			cc_number: testCards['Visa'],
			cc_billing_zip: '22222'
		});

		return SlidePay.payment.create(simplePayment).should.be.rejected;
	});
});