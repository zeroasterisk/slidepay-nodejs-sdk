SlidePay Node.js SDK
====================

Helper package for working with the [SlidePay](http://slidepay.com) REST API.

## Installation

This package will be published on npm once backward compatibility can be guaranteed. For now, you can install via git by running ```npm install git://github.com/slidepay/slidepay-nodejs-sdk.git```.

----------------------------

## Usage

### Authentication

You can either create a new instance of the SlidePay REST client either while requiring it or in a separate step:

When requiring:
```javascript
RestClient = require('node-slidepay')(credentials);
```

Afterward:
```javascript
slidepay = require('node-slidepay');
RestClient = new slidepay.RestClient(credentials);
```

A separate client instance should be used for each user/session (token or API key), so you'll want to use the latter method if you're processing payments for multiple users. The REST client expects a `credentials` object to be passed in and will throw an error if one isn't passed. This object must contain at least one of the following:

* Both an `email` and `password` corresponding to a SlidePay user account
* A SlidePay `token`
* A SlidePay `apiKey`

The library will always attempt to use the `apiKey` if defined, falling back to the `token`. In order to get a valid token, use the `login` method:

```javascript
RestClient.login().then(function() {
	// when the promise fulfills,
	// you are successfully logged in and can submit requests
});
```

The login method will store your token for use in requests and set the proper endpoint. You can always set `RestClient.auth.token`, `RestClient.auth.apiKey`, and `RestClient.endpoint` manually at any time.

### Making Requests

This package is heavily promise-based ([Q](https://github.com/kriskowal/q)). Creating a new [simple payment](https://getcube.atlassian.net/wiki/display/CDP/Processing+a+Simple+Payment) would be done as follows:
```javascript
RestClient.payment.create(simplePaymentObject).then(function(payment) {
	// payment is the data property of the SlidePay response body
}, function(err) {
	// if an error occurs at any point,
	// this function will be invoked with a Node error object
});
```

If you'd rather not use promises in your own implementation, you can pass Node-style callbacks and the library will call your callbacks when the resource promises resolve. Using the previous example:

```javascript
RestClient.payment.create(simplePaymentObject, function(err, payment) {
	if (err) {
		// an error ocurred and should be handled here.
		// payment will be null.
	}
	else {
		// no error
		// payment will be the SlidePay response body's data property
	}
});
```
The login method in callback style would be written as:

```javascript
RestClient.login(function(err) {
	if (err) {
		// there was a problem with login
	}
	else {
		// login occurred successfully and you can now make requests
	}
});
```

Generic requests can be made using the `RestClient.request` method which manages requests using the [request](https://github.com/mikeal/request) library and passes its options argument through. Use relative URLs in the `options.url` property. Your URL should have a leading slash and consist of everything you'd normally put after */rest.svc/API*.

### Resources

This package manages most of SlidePay's resources and methods. You don't need to use the actual HTTP endpoints. Resourced are properties of the RestClient.

Supported resources and methods are listed here:

* **api_key**: `create` `list` *`read` `delete`*
* **authorization**: `create` `void` *`capture.auto` `capture.manual`*
* **bank_account**: `create` *`read` `delete`*
* **merchant**: `createAccount` `boarding.createApplication` `boarding.submitAnswers`
* **payment**: `create` `store` `search` *`read` `refund`*
* **settlement**: `create` `balance` `search` *`read`*

Note that resource methods that are italicized are "instance" methods, whereas the rest are "class" methods. Methods with included dots have a root object—merchant, for example, has a boarding property with `createApplication` and `submitAnswers` methods. For a payment:

```javascript
// Use a class method to create the object
RestClient.payment.create(simplePaymentObject).then(function(payment) {
	// payment.id => 123
});

// Use an instance method to read the object
RestClient.payment.read('123').then(function(payment) {
	// the same payment object returned by payment.create
	// will be retrieved
});
```

## Testing

Tests expect a `credentials.json` file in the project's root directory with a valid username and password.

That file should be provided in a format similar to the following:

```json
{
	"email": "slidepay_account@example.com".
	"password": "SECRET_SLIDEPAY_PASSWORD",
	"apiKey": "IMPORTANT_SUPER_SECRET_SLIDEPAY_KEY_THAT_YOU_NEVER_SHARE" // Optional
}
```

Run the mocha tests with:

```bash
$ npm test
```

## Contributing

Please file an issue for any feature requests, questions, or bugs. If you'd like to contribute a new feature or fill gaps in the resources, fork the repository and issue a pull request. If you're adding new functionality, make sure to write appropriate tests.

## License

The MIT License

&copy; 2013 Ben Drucker and SlidePay
