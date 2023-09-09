const db = require('../database/db'); //improt db connectoin

const addComment = async(req, res) => {
    try {
        const { post_id, user_id, boxContent } = req.body;
        await db.promise().query('INSERT INTO comments (user_id, post_id, comment_text) VALUES (?,?,?)', [user_id, post_id, boxContent])
        res.status(200).json({ message: 'comment added successfully' })
    } catch (error) {
        res.status(500).json({ message: 'error adding comment' });
    }
}

const getCommentsFromPost = async(req, res) => {
    try {
        const { post_id } = req.body;
        const comments = await db.promise().query('SELECT * FROM comments where post_id = ?', [post_id])
        res.status(200).json(comments[0])
    } catch (error) {
        res.status(500).json({ message: 'error receiving comments' });
    }
}

module.exports = {
    addComment,
    getCommentsFromPost
};