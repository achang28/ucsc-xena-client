// Utilities for handling errors in async actions.

/*global require: false, module: false */
'use strict';

var Rx = require('rx');
var _ = require('../underscore_ext');
var {compositeError} = require('../errors');

// Put error object on stream, extending with context.
function reifyErrors(obs, context) {
	return obs.catch(err => Rx.Observable.return(_.extend(err, {context})));
}

// From an array of values, some of them errors, combine the successes into a
// single event, combine the errors and re-throw. This is a flatmap function.
function collectResults(arr, selector) {
	var groups = _.groupBy(arr, r => r instanceof Error),
		response = selector(groups.false || []),
		errors = groups.true;

	return errors ?
		Rx.Observable.return(response)
			.concat(Rx.Observable.throw(compositeError('Composite Error', ...errors))) :
		Rx.Observable.return(response);
}

module.exports = {
	reifyErrors,
	collectResults
};
