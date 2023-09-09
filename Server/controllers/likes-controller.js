const db = require('../database/db'); //improt db connectoin


const checkIfUserLikes = async(req, res) => {
    try {
        const { user_id, post_user_id } = req.body;
        const [rows] = await db.promise().query('SELECT * FROM likes WHERE user_id = ? and post_id = ?', [user_id, post_user_id]);
        res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}

const checkIfUserDislikes = async(req, res) => {
    try {
        const { user_id, post_user_id } = req.body;
        const [rows] = await db.promise().query('SELECT * FROM dislikes WHERE user_id = ? and post_id = ?', [user_id, post_user_id]);
        res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}
module.exports = {
    checkIfUserDislikes,
    checkIfUserLikes
};