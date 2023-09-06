async function getCurrentUserId() {
    const cookies = document.cookie.split(';');
    let [name, value] = cookies[cookies.length - 1].split('=');
    name = name.split(' ').join('')
    const response = await fetch('http://localhost:3000/api/users/getUserId', {
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
    console.log(data[0].user_id)
    return data[0].user_id;
}

function addActivity(user_id, activity) {
    const jsonData = {
        activity: activity,
        user_id: user_id
    }
    try {
        fetch('http://localhost:3000/api/activitylog/addActivity', {
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
    const user_id = await getCurrentUserId();
    adminWelcome(user_id);
    await addActivityFeed();
    await showAllUsers();
}

async function showAllUsers() {
    fetch('http://localhost:3000/api/users/getUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
    const jsonData = { user_id: user_id }
    const response = await fetch('http://localhost:3000/api/users/removeUser', {
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

    const response = await getActivityFromDB(activityType);
    const activity = await response.json();

    activity.forEach(activity => {
        const activityItemElement = document.createElement('li');
        const activity_done = (activity.activity_type === 'login') ? 'logged in' : (activity.activity_type === 'logout') ? 'logged out' : 'posted';
        activityItemElement.textContent = `${activity.full_name}(user Id:${activity.user_id}) has ${activity_done} at ${formatDateTime(activity.activity_time)}`;
        activityContainer.appendChild(activityItemElement);
    })
    activitiesContainer.appendChild(activityContainer);
}

function formatDateTime(dateTimeString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString(undefined, options);
}

async function getActivityFromDB(activityType) {
    const jsonData = { activity: activityType }
    const response = await fetch('http://localhost:3000/api/activitylog/getActivity', {
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