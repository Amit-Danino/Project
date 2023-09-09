const fs = require('fs');
const express = require('express');
const router = express.Router();
const jsonData = require('../database.json'); // Adjust the file path as needed

const primaryKeyMapping = {
    Users: 'user_id',
    Posts: 'post_id',
    Comments: 'comment_id',
    Likes: 'like_id',
    Dislikes: 'dislike_id',
    Follows: 'follow_id',
    ActivityLog: 'log_id',
    SuccessStories: 'story_id',
};


router.post("/insert", async(req, res) => {
    const table = req.body.table;
    const data = req.body.data;
    data[primaryKeyMapping[table]] = incrementId(table);
    writeData(table, data);
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
            console.log('User added successfully.');
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


module.exports = router;