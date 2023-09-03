const bcrypt = require('bcrypt'); // npm install bcrypt
const db = require('../database/db'); //improt db connectoin

const feed = async(req, res) => {
    const { userCountry } = req.body; // Assuming you receive the input 'country' in the request body
    //alert(req.body);
    console.log(userCountry);

    // Check if the 'country' input is provided
    if (!userCountry) {

        return res.status(400).json({ message: 'Country input is required.' });
    }

    try {
        // Assuming you have a 'posts' table with a 'country' column
        const posts = await db.promise().query(
            'SELECT users.full_name,users.user_id,posts.post_id ,posts.caption, posts.post_date, comments.comment_text, count(DISTINCT dislike_id) as DisLike, count(distinct like_id) as Likes FROM posts JOIN users ON users.user_id = posts.user_id JOIN  likes ON likes.post_id = posts.post_id JOIN  DisLikes ON DisLikes.post_id = posts.post_id JOIN comments ON comments.post_id = posts.post_id WHERE posts.user_Id IN (SELECT user_id FROM users WHERE users.country != ?) GROUP BY  users.full_name,users.user_id,posts.post_id,posts.caption, post_date, comments.comment_text ORDER BY post_date;', [userCountry]
        );
        res.status(200).json(posts[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const dislike = async(req, res) => {
    const { post_id, user_id } = req.body; // Correctly extract post_id and user_id

    try {
        // Assuming you have a 'likes' table with a 'post_id' and 'user_id' column
        await db.promise().query('INSERT INTO DisLikes (post_id, user_id) VALUES (?, ?)', [post_id, user_id]); // Correctly use post_id and user_id

        res.status(200).json({ message: 'Post disliked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error disliking post' });
    }
};

const cancelLike = async(req, res) => {
    const { post_id, user_id } = req.body;

    try {
        // Delete the like record
        await db.promise().query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);
        const updatedLikeCount = await getUpdatedLikeCount(postId); // Implement this function to get the updated count
        res.status(200).json({ message: 'Like canceled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error canceling like' });
    }
};


const like = async(req, res) => {
    const { post_id, user_id } = req.body; // Correctly extract post_id and user_id
    console.log("in like", post_id);
    try {
        // Assuming you have a 'likes' table with a 'post_id' and 'user_id' column
        await db.promise().query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [post_id, user_id]);
        await db.promise().query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [post_id, user_id]); // Correctly use post_id and user_id
        const updatedLikeCount = await getUpdatedLikeCount(post_id); // Use post_id instead of postId
        res.status(200).json({ message: 'Post liked successfully' }); //, //likeCount: updatedLikeCount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error liking post' });
    }
};

const getUpdatedLikeCount = async(post_id) => {
    try {
        // Query the database to get the updated like count for the given post
        const [rows] = await db.promise().query(
            'SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?', [post_id.toString()]
        );

        // Extract the likeCount from the database result
        const likeCount = rows[0].likeCount;

        return likeCount; // Return the likeCount
    } catch (error) {
        console.error('Error fetching updated like count:', error);
        return null;
    }
};


module.exports = {
    feed,
    like,
    dislike,
    cancelLike,
    getUpdatedLikeCount, // Add this line to export the function
};