const db = require('../database/db');

const selectSuccessStories = async(req, res) => {
    try {
        // Retrieve success stories from the database with user names
        const query =
            'SELECT users1.full_name AS user1_name, users2.full_name AS user2_name, successstories.story_text FROM successstories    LEFT JOIN users AS users1 ON users1.user_id = successstories.user1_id    LEFT JOIN users AS users2 ON users2.user_id = successstories.user2_id';
        const stories = await db.promise().query(query);
        console.log(stories[0]);
        // Send the success stories as a response
        res.status(200).json({ success: true, data: stories[0] });
    } catch (err) {
        console.error('Error fetching success stories:', err);
        res.status(500).json({ success: false, error: 'Error fetching data' });
    }
};

module.exports = {
    selectSuccessStories,
};