/*

Inspired by the Twilio Node helper library (https://github.com/twilio/twilio-node/blob/master/lib/resources/generate.js)
Generates HTTP client calls and REST functions for resources

*/

/*
Process the arguments and hand back properly formed params and callback properties regardless of input

@param {array} arguments - The set of arguments passed to the generated REST function
	- @param {object} params (optional) - Request parameters for the SlidePay API call
	- @param {function} callback (optional) - A callback to execute when the call returns

@returns {object} - A formatted arguments object even if 2 args are not passed in
*/

function process(args) {
	var params = (typeof args[0] !== 'function') ? args[0] : {},
		callback = (typeof args[0] === 'function') ? args[0] : args[1];

	return {
		params: params,
		callback: callback
	};
}

/*
Generate a function that will execute a call to the SlidePay API

@param {object} client - An instance of the API client (../lib/RestClient)
@param {string} method - The HTTP method, all caps
@param {string} url - The path to the requested resource
@param {boolean} authenticated - Set the generated function to be unauthenticated

@returns {function} - A function that will execute the HTTP request
*/

var generate = function(client, method, url, authenticated) {
	return function() {
		var args = process(arguments),
			requestArgs = {
				url: url,
				method: method,
				authRequired: authenticated
			};

		// Send parameters in the query string for GET requests
		if (args.params && method === 'GET') {
			requestArgs.qs = args.params;
		}
		// Send parameters as a JSON body otherwise
		else if (args.params) {
			requestArgs.json = args.params;
		}

		// Make the request

		// If there's a callback, pass it through
		if (args.callback) {
			client.request(requestArgs, args.callback);
		}
		// Otherwise return client.request, which will be a promise
		else {
			return client.request(requestArgs);
		}
	};
};

module.exports = generate;