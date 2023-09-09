const fs = require('fs');
const express = require('express');
const router = express.Router();
const jsonData = require('../database.json'); // Adjust the file path as needed
const bcrypt = require('bcrypt'); // npm install bcrypt

const primaryKeyMapping = {
    Users: 'user_id',
    Posts: 'post_id',
    Comments: 'comment_id',
    Likes: 'like_id',
    DisLikes: 'dislike_id',
    Follows: 'follow_id',
    ActivityLog: 'log_id',
    SuccessStories: 'story_id',
};


router.post("/insert", async(req, res) => {
    const table = req.body.table;
    const data = req.body.data;
    data[primaryKeyMapping[table]] = incrementId(table);
    writeData(table, data);
    res.status(200).json({});
});

router.post("/insertLikeIfNotExists", async(req, res) => {
    const table = req.body.table;
    const data = req.body.data;
    const existingLike = jsonData[table].some(entry =>
        entry.post_id === data.post_id && entry.user_id === data.user_id
    );

    if (!existingLike) {
        data[primaryKeyMapping[table]] = incrementId(table);
        writeData(table, data);
    }

    res.status(200).json({ response: existingLike });
});

router.post("/get_table_data", async(req, res) => {
    try {
        const table = req.body.table;
        res.status(200).json(jsonData[table]);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/get_table_data_id", async(req, res) => {
    try {
        const table = req.body.table;
        const field = req.body.field;
        const value = req.body.value;
        const data = jsonData[table].filter(entry => entry[field] === value);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/add_full_name", async(req, res) => {
    try {
        const data = req.body.data;
        const field = req.body.field;
        const userIdToFullNameMap = {};
        jsonData.Users.forEach(user => {
            userIdToFullNameMap[user.user_id] = user.full_name;
        });
        data.forEach(log => {
            log.full_name = userIdToFullNameMap[log[field]];
        });
        console.log(data)
            // const data = jsonData[table].filter(entry => entry[field] === value);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/getUsersNotFollow", async(req, res) => {
    try {
        const user_id = req.body.user_id;
        const followingUserIds = jsonData["Follows"]
            .filter(entry => entry.follower_user_id === user_id)
            .map(entry => entry.following_user_id);

        const usersNotFollowed = jsonData["Users"].filter(user => {
            return user.user_id !== user_id && !followingUserIds.includes(user.user_id);
        });
        res.status(200).json(usersNotFollowed);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/get_table_data_id_2_values", async(req, res) => {
    try {
        const table = req.body.table;
        const field1 = req.body.field1;
        const field2 = req.body.field2;
        const value1 = req.body.value1;
        const value2 = req.body.value2;

        const data = jsonData[table].filter(entry => {
            return entry[field1] == value1 && entry[field2] == value2;
        });
        res.status(200).json(data);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/explore", async(req, res) => {
    try {
        const country = req.body.country;
        const filteredPosts = jsonData['Posts'].filter(post => {
            const user = jsonData['Users'].find(user => user.user_id === post.user_id);
            return user && user.country !== country;
        });
        const sortedPosts = filteredPosts.sort((a, b) => b.post_id - a.post_id);
        add_full_name_using_user_id(sortedPosts);
        res.status(200).json(sortedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error in showing explore posts' });
    }
})

router.post("/feed", async(req, res) => {
    try {
        const user_id = req.body.user_id;

        const followedUserIds = jsonData['Follows']
            .filter(follow => follow.follower_user_id === user_id)
            .map(follow => follow.following_user_id);
        followedUserIds.push(user_id);

        const filteredPosts = jsonData['Posts'].filter(post => {
            const user = jsonData['Users'].find(user => user.user_id === post.user_id);
            return user && followedUserIds.includes(user.user_id);
        });

        const sortedPosts = filteredPosts.sort((a, b) => b.post_id - a.post_id);
        add_full_name_using_user_id(sortedPosts);
        res.status(200).json(sortedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error in showing explore posts' });
    }
})

router.post("/modify_feature", async(req, res) => {
    try {
        const feature = req.body.feature;
        const info = req.body.info;
        jsonData.features.forEach(iterateFeature => {
            if (iterateFeature.feature_name == feature) {
                iterateFeature.feature_status = info;
            }
        })
        overwriteJSON(jsonData);

        res.status(200).json({ message: 'modified feature successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in modifying feature' });
    }
})

router.post("/remove_by_id", async(req, res) => {
    try {
        const table = req.body.table;
        const id_number = req.body.id;
        const id_name = primaryKeyMapping[table];

        jsonData[table] = jsonData[table].filter(entry => entry[id_name] != id_number);
        overwriteJSON(jsonData);

        res.status(200).json({ message: 'modified feature successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in modifying feature' });
    }
})
router.post("/remove_by_2_ids", async(req, res) => {
    try {
        const table = req.body.table;
        const id1 = req.body.id1;
        const id2 = req.body.id2;
        const id_value_1 = req.body.id_value_1;
        const id_value_2 = req.body.id_value_2;
        jsonData[table] = jsonData[table].filter(entry => {
            return entry[id1] !== id_value_1 || entry[id2] !== id_value_2;
        });

        overwriteJSON(jsonData);

        res.status(200).json({ message: 'modified feature successfully' });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in modifying feature' });
    }
})
router.post("/getUserId", async(req, res) => {
    try {
        const email = req.body.email;

        const user = jsonData.Users.find(user => user.email === email);

        if (user) {
            res.status(200).json(user.user_id);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error('Error in getUserId:', error);
        res.status(500).json({ message: 'Error in getUserId' });
    }
})

router.post("/getActivity", async(req, res) => {
    try {
        const activity = req.body.activity;
        const activityResult = jsonData.ActivityLog.filter((element) => element.activity_type == activity);
        activityResult.sort((a, b) => b.log_id - a.log_id);
        add_full_name_using_user_id(activityResult);
        res.status(200).json(activityResult);
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/addActivity", async(req, res) => {
    try {
        const log_id = incrementId("ActivityLog");
        const user_id = req.body.user_id;
        const activity_type = req.body.activity;
        const activity_time = new Date();

        const data = {
            log_id: log_id,
            user_id: user_id,
            activity_type: activity_type,
            activity_time: activity_time,
        }

        add_full_name_using_user_id([data]);
        writeData("ActivityLog", data);

        res.status(200).json({ message: "added activity successfully" });
    } catch (error) {
        console.error('Error in unfollow:', error);
        res.status(500).json({ message: 'Error in unfollowing' });
    }
})

router.post("/encryptPass", (req, res) => {
    try {
        const body = req.body;
        const hashed_password = body.password_hashed
        const password = body.passwordToHash;
        bcrypt.compare(password, hashed_password, (err, result) => {
            if (err) {
                // Handle the error (e.g., log it or return an error response)
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else if (result) {
                // Passwords match, authentication is successful
                return res.status(200).json({ success: true, message: 'Authentication successful' });
            } else {
                // Passwords do not match, authentication failed
                return res.status(200).json({ success: false, message: 'Invalid email or password' });
            }
        });
    } catch (error) {
        console.error('Error encrypting password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

function add_full_name_using_user_id(data) {
    const userIdToFullNameMap = {};
    jsonData.Users.forEach(user => {
        userIdToFullNameMap[user.user_id] = user.full_name;
    });
    data.forEach(log => {
        log.full_name = userIdToFullNameMap[log.user_id];
    });
}

//Users: user_id, Posts: post_id, Comments: comment_id, Likes: like_id, Dislikes: dislike_id, Follows: follow_id, ActivityLog: log_id, SuccessStories: story_id
function incrementId(table) {
    const tableLength = jsonData[table].length;
    const recentEntry = jsonData[table][tableLength - 1];

    return recentEntry[primaryKeyMapping[table]] + 1;
}

function writeData(table, data) {
    jsonData[table].push(data);
    const updatedJsonData = JSON.stringify(jsonData, null, 2);
    fs.writeFile('./database.json', updatedJsonData, (err) => {
        if (err) {
            console.error('Error writing to JSON file:', err);
        } else {
            console.log(`${table} added successfully: `, data);
        }
    })
};

function overwriteJSON(jsonData) {
    try {
        const updatedJsonData = JSON.stringify(jsonData, null, 2);
        fs.writeFile('./database.json', updatedJsonData, (err) => {
            if (err) {
                console.error('Error writing to JSON file:', err);
            } else {
                console.log('Data overwritten successfully.');
            }
        })
    } catch (error) {
        console.log("error overwriting: ", error)
    }
}

const encryptPassFunc = (password) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};


module.exports = router;