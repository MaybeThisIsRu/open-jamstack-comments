exports.handler = (event, context, callback) => {
	const params = JSON.parse(event.queryStringParameters);
	console.log("Params for approve-comment: ", params);
};
