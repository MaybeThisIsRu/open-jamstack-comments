// Load env variables into process.env
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const _unionBy = require("lodash.unionby");

const { NETLIFY_PAT, APPROVED_COMMENTS_FORM_ID } = process.env;
const CACHE_PATH = path.resolve(__dirname, "../cache/comments.json");

const NetlifyAPI = require("netlify");
const NetlifyClient = new NetlifyAPI(NETLIFY_PAT);

/**
 * @description Retrieves cached comments from filesystem
 * @param {string} [path] Path to comments cache file, defaults to CACHE_PATH
 * @returns {Object} Object with last fetched date and comments array. null if not found.
 */
const getCache = (path = CACHE_PATH) => {
	if (fs.existsSync(path)) {
		return JSON.parse(fs.readFileSync(path));
	} else {
		return {
			lastFetched: new Date(),
			items: []
		};
	}
};

/**
 * @description Synchronously writes comments data to file system, marking current date alongside. File will be created if it does not exist.
 * @param {Object[]} commentsWithDate
 */
const writeCache = commentsWithDate => {
	fs.writeFileSync(CACHE_PATH, JSON.stringify(commentsWithDate));
};

/**
 * @description Merge live comments with cache
 * @param {Object[]} live Live comments
 * @param {Object} cache Cached comments
 * @param {string} cache[].lastFetched Datetime stamp for when the data was last fetched
 * @param {Object[]} cache[].items List of comments
 * @returns {Object} Merged object, with a datetime stamp, of cached and live comments
 */
const mergeComments = (live, cache) => {
	return _unionBy(live, cache.items, "id");
};

/**
 * @description Fetch live comments data and save to cache.
 * @param {string} form_id Form ID as seen on Netlify admin. Falls back to env variable APPROVED_COMMENTS_FORM_ID.
 * @returns {Promise} Live comments data.
 */
const getLiveComments = (form_id = APPROVED_COMMENTS_FORM_ID) => {
	return new Promise((resolve, reject) => {
		NetlifyClient.listFormSubmissions({
			form_id
		})
			.then(response => resolve(response))
			.catch(error => {
				reject(
					new Error(
						`Failed to get form submissions from Netlify API. Falling back to old cache of comments. Details: ${error}`
					)
				);
			});
	});
};

/**
 * @returns {Promise} Last fetched date and comments data. Could be live or cached.
 */
module.exports = () => {
	return new Promise((resolve, reject) => {
		getLiveComments()
			.then(response => {
				const merged = mergeComments(response, getCache());
				const mergedWithDate = {
					lastFetched: new Date(),
					items: merged
				};
				writeCache(mergedWithDate);
				resolve(mergedWithDate);
			})
			.catch(error => {
				console.warn(error);
				resolve(getCache());
			});
	});
};
