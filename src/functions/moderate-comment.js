exports.handler = (event, context, callback) => {
	// Description: Copy to approved-comments form, then delete from comment-submissins form
	const NetlifyAPI = require("netlify");
	const fetch = require("node-fetch"); // Netlify doesn't offer an endpoint for creating a form submission
	const { form_id, comment_id, action } = event.queryStringParameters;
	const { NETLIFY_PAT } = process.env;

	console.log(form_id, comment_id, action);

	const NetlifyClient = new NetlifyAPI(NETLIFY_PAT);

	const deleteComment = form_id => {
		NetlifyClient.deleteSubmission({ form_id })
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
		}).then(response => {
			const submissionDetails = JSON.parse(response.body);
			// Construct data and submit as a new submission to approved-comments form
			const formData = {
				"form-name": "approved-comments",
				name: submissionDetails.data.name,
				email: submissionDetails.data.email,
				comment: submissionDetails.data.comment,
				referrer: submissionDetails.data.referrer,
				// created_at reserved for Netlify, using submitted_at
				submitted_at: submissionDetails.created_at
			};

			fetch(`http://api.netlify.com/api/v1/submissions/`, {
				method: "post",
				body: JSON.stringify(formData),
				headers: {
					"Content-Type": "application/json"
				}
			})
				.then(res => res.json())
				.then(data => console.log(data));
			// TODO Delete the comment from comment-submissions
			// TODO Trigger a rebuild by sending POST to notification hook
		});
	}
};
