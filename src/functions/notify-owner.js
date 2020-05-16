// Triggered by a Netlify event - form submission created (excludes spam)
// Send an email to the site owner with comment details, approve link, and a discard/delete link

exports.handler = (event, context, callback) => {
	// const sgMail = require("@sendgrid/mail");
	// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

	const ownerEmail = "inbox@rusingh.com";
	const siteName = "Open JAMStack Comments";

	console.log(event, context);

	callback(null, {
		statusCode: 200,
		body: "Done running"
	});

	// const msg = {
	// 	to: ownerEmail,
	// 	from: ownerEmail,
	// 	subject: `New comment received on ${siteName}`,
	// 	text: `
	// 		You have received a new comment, details as follows:
	// 		Event: ${event}
	// 		Context: ${context}
	// 		`,
	// 	html: `
	// 		<p>You have received a new comment, details as follows:</p>
	// 		<p><strong>Event:</strong> <pre>${event}</pre></p>
	// 		<p><strong>Context:</strong> <pre>${context}</pre></p>
	// 		`
	// };
	// sgMail.send(msg);
};
