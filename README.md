# Open JAMstack Comments

Inspired by Phil Hawksworth's [Jamstack Comments Engine](https://github.com/philhawksworth/jamstack-comments-engine). Uses 📬 email for comment moderation.

__Work In Progress.__

## Configuration

### Environment Variables

- `NETLIFY_PAT` - personal access token for Netlify API
- `NETLIFY_API_ID` - API ID from the Settings page. This is the Site ID.
- `APPROVED_COMMENTS_FORM_ID` - form ID of the form where approved submissions are moved
- `SENDGRID_API_KEY` - key received from Sendgrid

### Email Web API

I use [Sendgrid](https://sendgrid.com/). They have a free 100 mail/day limit (pretty generous) and a JavaScript library for communicating with their API.

- Configure the `SENDGRID_API_KEY` as listed above.
- Then update `ownerEmail` and `siteName` in the `notify-owner.js` function.
