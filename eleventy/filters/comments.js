module.exports = {
	/**
	 * @description Given a path string, filter all those comments where the path matches the path provided, currently that of the article
	 * @param {Object[]} comments List of comments
	 * @param {string} path Path of the currentl article page
	 * @returns {Object[]} List of comments for current page
	 */
	filterCommentsForPath: (comments, path) => {
		if (comments.length)
			return comments.filter(c => c.data.path.includes(path));
		else return [];
	}
};
