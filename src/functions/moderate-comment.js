exports.handler = (event, context, callback) => {
	// Description: Copy to approved-comments form, then delete from comment-submissins form
	const { URL } = require("url");
	const NetlifyAPI = require("netlify");
	const fetch = require("node-fetch");
	const qs = require("qs");

	const { comment_id, action } = event.queryStringParameters;
	const { NETLIFY_PAT } = process.env;
	const BUILD_HOOK =
		"https://api.netlify.com/build_hooks/5ecf84bcf944641148f65ee4";

	const NetlifyClient = new NetlifyAPI(NETLIFY_PAT);

	const deleteComment = comment_id => {
		// TODO Implement Netlify callbacks for success and error
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
				// Construct data and submit as a new submission to approved-comments form
				const formData = {
					// form-name is required by Netlify
					"form-name": "approved-comments",
					name: response.data.name,
					email: response.data.email,
					comment: response.data.comment,
					path: new URL(response.data.referrer).pathname,
					// created_at reserved for Netlify, using submitted_at
					submitted_at: response.created_at
				};

				const paramString = qs.stringify(formData, {
					charset: "utf-8"
				});

				console.log(
					"Form data being submitted to approved-comments form:",
					paramString
				);

				let endpoint = new URL(`${response.site_url}/thank-you/`);
				if (endpoint.protocol === "http:") {
					endpoint.protocol = "https:";
				}
				console.log("Sending data to", endpoint);

				// Netlify forms do not accept JSON - https://docs.netlify.com/forms/setup/#submit-forms-via-ajax
				fetch(endpoint, {
					method: "POST",
					body: paramString,
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				})
					.then(data => {
						console.log(data);

						// Delete the comment from comment-submissions
						deleteComment(comment_id);

						// Trigger build
						fetch(BUILD_HOOK, { method: "POST" });

						callback(null, {
							statusCode: 200,
							body: "Comment approved successfully."
						});
					})
					.catch(error => {
						console.log(error);
						callback(
							{
								statusCode: 500,
								body:
									"An error occured while approving the comment."
							},
							null
						);
					});
			})
			.catch(error => {
				console.log(error);
				callback(
					{
						statusCode: 500,
						body:
							"An error occured while fetching details for this comment. Please try again later or check the server logs."
					},
					null
				);
			});
	}
};
