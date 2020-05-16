# Open JAMstack Comments

## Writing a Comments engine based on Netlify Forms API, Functions API, and Sendgrid API

* Put form on site per Netlify docs
* By default, submit comment data to a form called `comments-queue`
* A form submission to `comments-queue` should trigger a Netlify lambda function, specifically on the event `submission-created`
* The lambda function then uses Functions API & Sendgrid API to send an email to my email address, with things like comment data, an approve URL, and a reject URL
* Clicking on any of the two URLs should trigger separate handling (delete from `comments-queue` or move to `approved-comments` depending on endpoint triggered).
* A gulp function that upon build trigger, will collect all submissions into a data file.
* The data file is then consumed by 11ty.
