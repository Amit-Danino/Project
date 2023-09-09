async function getCurrentUserId() {
    const cookies = document.cookie.split(';');
    let [name, value] = cookies[cookies.length - 1].split('=');
    name = name.split(' ').join('')
    const response = await fetch('http://localhost:3000/api/persist/getUserId', {
        method: 'POST',
        body: JSON.stringify({ email: name }), // Make sure you define post_id and user_id
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}

function addActivity(user_id, activity) {
    const jsonData = {
        activity: activity,
        user_id: user_id
    }
    try {
        fetch('http://localhost:3000/api/persist/addActivity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        });
        return true;
    } catch (error) {
        alert(`error adding ${activity} activity`)
        return false;
    }
}

const logoutButton = document.getElementById('logoutButton');
logoutButton.addEventListener('click', async() => {
    const user_id = await getCurrentUserId();
    const pastDate = new Date();
    pastDate.setTime(pastDate.getTime() - (1 * 24 * 60 * 60 * 1000));
    document.cookie = 'logout=logout;expires=' + pastDate.toUTCString() + ';path=/';
    document.cookie = 'logout=logout;path=/';
    addActivity(user_id, 'logout');
})

function adminWelcome(user_id) {
    if (user_id != 1) {
        alert('Only admins are allowed to view this page.');
        window.location.href = 'login.html';
    }
}
const loadAdminFeed = async() => {
    try {
        const user_id = await getCurrentUserId();
        adminWelcome(user_id);
        await addActivityFeed();
        await showAllUsers();
        await additionalFeaturePages();
    } catch (error) {
        alert('Please log in to view the admin page.');
        window.location.href = 'login.html';
    }
}

async function testPersist() {
    // testInsertData();
    // testReadData();
}

async function testReadData() {
    await fetch('http://localhost:3000/api/persist/get_table_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table: "Posts" }),
        })
        .then((response) => {
            if (!response.ok) {
                console.log("not ok response")
                throw new Error('Network response was not ok');
            }
            return response.json(); // You can use response.json() if the server sends JSON back
        })
        .then((data) => {
            return data;
        })
}

async function testInsertData() {
    const featureData = {
        table: "Users",
        data: {
            // user_id: 16,
            username: "admin",
            email: "admin",
            password_hash: "admin",
            full_name: "admin admin",
            bio: "Foodie and blogger",
            profile_picture_url: "profile3.jpg",
            country: "Israel",
            registration_date: "1996-11-07T00:00:00.000Z",
            birth_date: "1996-11-07",
            gender: "male"
        },
    };
    fetch('http://localhost:3000/api/persist/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(featureData),
    })
}

async function getFeatureData() {
    return fetch('http://localhost:3000/api/persist/get_table_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table: "features" })
        })
        .then((response) => {
            if (!response.ok) {
                console.log("not ok response")
                throw new Error('Network response was not ok');
            }
            return response.json(); // You can use response.json() if the server sends JSON back
        })
        .then((data) => {
            return data;
        })
        .catch((error) => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function getStatus(feature_Data, feature_name) {
    let status_to_return = "Enabled";
    feature_Data.forEach(feature => {
        if (feature.feature_name == feature_name) {
            status_to_return = feature.feature_status
        }
    })

    return status_to_return
}

function statusToText(status) {
    if (status == 'disabled') {
        return 'Enable'
    }

    return 'Disable'
}
async function additionalFeaturePages() {
    const data = await getFeatureData();
    const feedContainer = document.getElementById('feed');
    const featureContainer = document.createElement('div');
    featureContainer.classList.add('featureContainer');
    createFeatureDeletionComponent(data, 'dislikes', featureContainer);
    createFeatureDeletionComponent(data, 'comments', featureContainer);
    createFeatureDeletionComponent(data, 'aboutMe', featureContainer);
    createFeatureDeletionComponent(data, 'successStories', featureContainer);
    feedContainer.appendChild(featureContainer);
}

function createFeatureDeletionComponent(data, feature, featureContainer) {
    const paragraph = document.createElement("p");
    paragraph.classList.add('paragraph-feature');
    paragraph.textContent = `Toggle ${feature} feature -> `;

    const enableButton = document.createElement("button");
    enableButton.classList.add('feature-button');
    enableButton.textContent = statusToText(getStatus(data, feature));

    enableButton.addEventListener("click", async() => {
        const data = await getFeatureData();
        const status = getStatus(data, feature)
        if (status == 'disabled') {
            enableButton.textContent = 'Disable'
            modifyFeatureData(feature, 'enabled');
            enableButton.style.backgroundColor = 'red';
        } else {
            enableButton.textContent = 'Enable'
            modifyFeatureData(feature, 'disabled');
            enableButton.style.backgroundColor = '#3498db';
        }
    });
    if (enableButton.textContent == 'Disable') {
        enableButton.style.backgroundColor = 'red';
    }
    paragraph.appendChild(enableButton);

    featureContainer.appendChild(paragraph);
    // document.body.appendChild(paragraph);
}

async function modifyFeatureData(feature, info) {

    const featureData = {
        feature: feature,
        info: info,
    };

    fetch('http://localhost:3000/api/persist/modify_feature', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(featureData),
    })
}

async function showAllUsers() {
    fetch('http://localhost:3000/api/persist/get_table_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ table: "Users" })
        })
        .then(response => response.json())
        .then(users => {
            const feedContainer = document.getElementById('feed');
            const allUsersContainer = document.createElement('div');
            allUsersContainer.classList.add('users-container');
            feedContainer.appendChild(allUsersContainer)
            users.forEach(user => {
                const userItemElement = document.createElement('li');
                userItemElement.classList.add('user-item');
                const userInfoSpan = document.createElement('span');
                userInfoSpan.textContent = `User ID: ${user.user_id}, Username: ${user.full_name}`;
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Remove';
                removeButton.id = user.user_id;
                removeButton.addEventListener('click', async() => {
                    const confirmed = window.confirm('Are you sure you want to remove this user?');
                    if (confirmed) {
                        const user_id = removeButton.id;
                        if (user_id == 1) {
                            alert("Naughty admin, you can't remove yourself!")
                            return;
                        }
                        await removeUser(user_id);
                        userItemElement.remove();
                    }
                });

                userItemElement.appendChild(userInfoSpan);
                userItemElement.appendChild(removeButton);
                allUsersContainer.appendChild(userItemElement);
            })
        })
        .catch(error => {
            console.log("unable to show users for admin!")
        })
}

async function removeUser(user_id) {
    const jsonData = { table: "Users", id: user_id }
    const response = await fetch('http://localhost:3000/api/persist/remove_by_id', {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Error getting activity feed');
    }

    return response;
}

async function addActivityFeed() {
    const feedContainer = document.getElementById('feed');
    const activitiesContainer = document.createElement('div');
    activitiesContainer.id = 'activities-container';
    activitiesContainer.classList.add('activity-containers');
    feedContainer.appendChild(activitiesContainer);

    addActivityToFeed('post');
    addActivityToFeed('login');
    addActivityToFeed('logout');


}

async function addActivityToFeed(activityType) {
    const activitiesContainer = document.getElementById('activities-container');

    const activityContainer = document.createElement('div');
    activityContainer.classList.add(`${activityType}-activity-container`);

    const titleElement = document.createElement('h2');
    titleElement.textContent = `All recent ${activityType}s`;
    activityContainer.appendChild(titleElement);

    const activity = await getActivityFromDB(activityType);

    activity.forEach(activity => {
        const activityItemElement = document.createElement('li');
        const activity_done = (activity.activity_type === 'login') ? 'logged in' : (activity.activity_type === 'logout') ? 'logged out' : 'posted';
        activityItemElement.textContent = `${activity.full_name}(user Id:${activity.user_id}) has ${activity_done} ${timeAgo(activity.activity_time)} (${formatDateTime(activity.activity_time)})`;
        activityContainer.appendChild(activityItemElement);
    })
    activitiesContainer.appendChild(activityContainer);
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString(undefined, options);
}

function timeAgo(dateTimeString) {
    const currentDate = new Date();
    const targetDate = new Date(dateTimeString);

    const timeDifference = currentDate - targetDate;
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''} ago`;
    }
}


async function getActivityFromDB(activityType) {
    const jsonData = { activity: activityType }
    const response = await fetch('http://localhost:3000/api/persist/getActivity', {
        method: 'POST',
        body: JSON.stringify(jsonData),
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Error getting activity feed');
    }
    const data = await response.json();
    return data;
}