exports.handler = (event, context, callback) => {
	const params = JSON.parse(event.queryStringParameters);
	console.log("Params for delete-comment: ", params);
};
