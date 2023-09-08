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


const following = async(req, res) => {
    const { user_id } = req.body;
    try {
        console.log(user_id);
        const rows = await db.promise().query(
            'SELECT user_id, full_name FROM users WHERE user_id IN (SELECT following_user_id FROM follows WHERE follower_user_id = ?);', [user_id]
        );
        // Extract both user_id and full_name values from the result rows
        console.log(rows);
        //  const followersList = rows.map((row) => ({ user_id: row.user_id, full_name: row.full_name }));
        res.status(200).json(rows[0]);
        //res.status(200).json({ followers: followersList });
    } catch (error) {
        console.error('Error in followers:', error);
        res.status(500).json({ message: 'Error in followers' });
    }
};

const followers = async(req, res) => {
    const { user_id } = req.body;
    try {
        const rows = await db.promise().query(
            'SELECT user_id, full_name FROM users WHERE user_id IN (SELECT follower_user_id FROM follows WHERE following_user_id = ?);', [user_id]
        );
        // Extract both user_id and full_name values from the result rows

        res.status(200).json(rows[0]);


        //const followingList = rows.map((row) => ({ user_id: row.user_id, full_name: row.full_name }));
        //res.status(200).json({ following: followingList });
    } catch (error) {
        console.error('Error in following:', error);
        res.status(500).json({ message: 'Error in following' });
    }
};

const remove = async(req, res) => {
    const { user_id, current_user_id } = req.body; // Modify to accept user_id
    console.log(user_id);

    try {
        await db.promise().query('DELETE FROM follows WHERE following_user_id = ? AND follower_user_id = ?', [current_user_id, user_id]);
        // Send a success response
        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
};

const unfollow = async(req, res) => {
    const { user_id, current_user_id } = req.body; // Modify to accept user_id
    console.log(user_id);

    try {
        await db.promise().query('DELETE FROM follows WHERE following_user_id = ? AND follower_user_id = ?', [user_id, current_user_id]);
        // Send a success response
        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
};


const follow = async(req, res) => {
    const { user_id, current_user_id } = req.body; // Modify to accept user_id
    console.log(user_id);

    try {
        await db.promise().query('INSERT INTO Follows (follower_user_id, following_user_id) VALUES(?, ?);', [current_user_id, user_id]);
        // Send a success response
        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
};


const getUsersNotFollow = async(req, res) => {
    const { user_id, current_user_id } = req.body;
    try {
        //TODO:change to not hard coded
        console.log(user_id);
        const rows = await db.promise().query(
            'SELECT user_id,full_name from users Where user_id != ? and users.user_id NOT IN (SELECT following_user_id FROM follows WHERE follower_user_id = ?);', [current_user_id, current_user_id]
        );
        // Extract both user_id and full_name values from the result rows
        console.log(rows);
        //  const followersList = rows.map((row) => ({ user_id: row.user_id, full_name: row.full_name }));
        res.status(200).json(rows[0]);
        //res.status(200).json({ followers: followersList });
    } catch (error) {
        console.error('Error in followers:', error);
        res.status(500).json({ message: 'Error in followers' });
    }
};


module.exports = {
    addFollow,
    removeFollow,
    checkIfUserFollows,
    followers,
    following,
    remove,
    unfollow,
    getUsersNotFollow,
    follow
};