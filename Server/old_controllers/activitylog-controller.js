const db = require('../database/db'); //improt db connectoin

const addActivity = async(req, res) => {
    try {
        const { activity, user_id } = req.body;
        await db.promise().query('INSERT INTO ActivityLog (user_id, activity_type) VALUES (?,?)', [user_id, activity]);
        await db.promise().query('DELETE a FROM ActivityLog a JOIN ActivityLog b ON a.user_id = b.user_id AND a.activity_type = b.activity_type AND a.activity_time = b.activity_time WHERE a.log_id > b.log_id;');
        res.status(200).json({ message: 'login activity added successfully' })
    } catch (error) {
        res.status(500).json({ message: 'error adding login activity' });
    }
}

const getActivity = async(req, res) => {
    try {
        const { activity } = req.body;
        const [data] = await db.promise().query('SELECT al.*, u.full_name FROM ActivityLog al JOIN users u ON al.user_id = u.user_id WHERE activity_type = ? ORDER BY al.log_id DESC', [activity]);
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({ message: 'error getting activity' });
    }
}

module.exports = {
    addActivity,
    getActivity
};