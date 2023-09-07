const db = require('../database/db'); //improt db connectoin

const addFollow = async(req, res) => {
    try {
        const { user_id, post_user_id } = req.body;
        await db.promise().query('INSERT INTO follows (follower_user_id, following_user_id) VALUES (?,?)', [user_id, post_user_id]);
        // await db.promise().query('DELETE a FROM ActivityLog a JOIN ActivityLog b ON a.user_id = b.user_id AND a.activity_type = b.activity_type AND a.activity_time = b.activity_time WHERE a.log_id > b.log_id;');
        res.status(200).json({ message: 'login activity added successfully' })
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}

const removeFollow = async(req, res) => {
    try {
        const { user_id, post_user_id } = req.body;
        await db.promise().query('DELETE FROM follows WHERE follower_user_id = ? AND following_user_id = ?', [user_id, post_user_id]);
        res.status(200).json({ message: 'login activity added successfully' })
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}

const checkIfUserFollows = async(req, res) => {
    try {
        const { user_id, post_user_id } = req.body;
        const [rows] = await db.promise().query('SELECT * FROM follows WHERE follower_user_id = ? and following_user_id = ?', [user_id, post_user_id]);
        res.status(200).json(rows)
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}

module.exports = {
    addFollow,
    removeFollow,
    checkIfUserFollows
};