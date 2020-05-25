// https://gist.github.com/lastguest/1fd181a9c9db0550a847#gistcomment-3062641
/**
 * @param {Object} object
 * @return {string}
 */
const toFormUrlEncoded = object => {
	return Object.entries(object)
		.map(
			([key, value]) =>
				`${encodeURIComponent(key)}=${encodeURIComponent(value)}`
		)
		.join("&");
};

exports.handler = (event, context, callback) => {
	// Description: Copy to approved-comments form, then delete from comment-submissins form
	const NetlifyAPI = require("netlify");
	const fetch = require("node-fetch"); // Netlify doesn't offer an endpoint for creating a form submission
	const { form_id, comment_id, action } = event.queryStringParameters;
	const { NETLIFY_PAT } = process.env;

	const NetlifyClient = new NetlifyAPI(NETLIFY_PAT);

	const deleteComment = comment_id => {
		NetlifyClient.deleteSubmission({ submission_id: comment_id })
			.then(response => {
				console.log(response);
			})
			.catch(error => {
				console.log(error);
			});
	};

	if (action === "delete") {
		console.log("Deleting comment...");
		deleteComment(comment_id);
	} else if (action === "approve") {
		console.log("Approving comment...");
		// Fetch comment details
		NetlifyClient.listFormSubmission({
			submission_id: comment_id
		})
			.then(response => {
				console.log(response);
				const submissionDetails = JSON.parse(response.data);
				// Construct data and submit as a new submission to approved-comments form
				// form-name is required by Netlify
				const formData = {
					"form-name": "approved-comments",
					name: submissionDetails.data.name,
					email: submissionDetails.data.email,
					comment: submissionDetails.data.comment,
					referrer: submissionDetails.data.referrer,
					// created_at reserved for Netlify, using submitted_at
					submitted_at: submissionDetails.created_at
				};

				// Netlify forms do not accept JSON
				// https://docs.netlify.com/forms/setup/#submit-forms-via-ajax
				fetch(
					`${response.site_url}/approved-comments-form-vrFGB4T1rOYLs5Ba/`,
					{
						method: "post",
						body: toFormUrlEncoded(formData),
						headers: {
							"Content-Type": "application/x-www-form-urlencoded"
						}
					}
				)
					.then(res => res.json())
					.then(data => {
						console.log(data);
						callback(null, {
							statusCode: 200,
							msg: "Comment approved successfully."
						});
					});
				// TODO Delete the comment from comment-submissions
				// TODO Trigger a rebuild by sending POST to notification hook
			})
			.catch(error => {
				console.log(error);
				callback(
					{
						statusCode: 500,
						msg: error
					},
					null
				);
			});
	}
};
