// Triggered by a Netlify event - form submission created (excludes spam)
// Send an email to the site owner with comment details, approve link, and a discard/delete link

exports.handler = (event, context, callback) => {
	const sgMail = require("@sendgrid/mail");
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	const ownerEmail = "inbox@rusingh.com";
	const siteName = "Open JAMStack Comments";
	const details = JSON.parse(event.body);
	const { id, form_id, site_url } = details;
	const functionsBaseUrl = `${site_url}/.netlify/functions/{function_name}`;
	const deleteFnUrl = functionsBaseUrl.replace(
		"{function_name}",
		`delete-comment?form_id=${form_id}&comment_id=${id}`
	);
	const approveFnUrl = functionsBaseUrl.replace(
		"{function_name}",
		`approve-comment?form_id=${form_id}&comment_id=${id}`
	);

	const msg = {
		to: ownerEmail,
		from: ownerEmail,
		subject: `New comment received on ${siteName}`,
		text: `
			You have received a new comment, details as follows:
			Site: ${siteName}
			Comment Author: ${details.data.name}
			Author Email: ${details.data.email}
			Comment: ${details.data.comment}
			Submitted at: ${details.created_at}
			Referrer: ${details.data.referrer}

			Delete comment: ${deleteFnUrl}
			Approve comment: ${approveFnUrl}
			`,
		html: `
			<p>You have received a new comment, details as follows:</p>
			<p><strong>Site:</strong> <pre>${siteName}</pre></p>
			<p><strong>Comment Author:</strong> <pre>${details.data.name}</pre></p>
			<p><strong>Author Email:</strong> <pre>${details.data.email}</pre></p>
			<p><strong>Comment:</strong> <pre>${details.data.comment}</pre></p>
			<p><strong>Submitted at:</strong> <pre>${details.created_at}</pre></p>
			<p><strong>Referrer:</strong> <pre>${details.data.referrer}</pre></p>
			<p>Please <a href="${approveFnUrl}">approve</a> or <a href="${deleteFnUrl}">delete</a>.</p>
			`
	};
	sgMail.send(msg, false, (error, result) => {
		// API docs indicate a 202 response with null data ('body') on success
		// https://sendgrid.api-docs.io/v3.0/mail-send/v3-mail-send
		if (result && result.statusCode === 202) {
			callback(null, {
				statusCode: 200,
				body: "Notification email sent to site owner"
			});
		}
		if (error) {
			callback(
				{
					statusCode: 500,
					error: error
				},
				null
			);
		}
	});
};
