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

async function addFollow(user_id, post_user_id) {
    try {
        jsonData = { table: 'Follows', data: { follower_user_id: user_id, following_user_id: post_user_id, follow_date: new Date() } }
        const response = await fetch('http://localhost:3000/api/persist/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
    } catch (error) {
        console.error('Error adding follow:', error);
        return null;
    }
}


// Function to retrieve followers data from the server
async function getFollowingData(user_id) {
    try {
        // const current_user_id = await getCurrentUserId();
        const jsonData = { table: "Follows", field: "follower_user_id", value: user_id };
        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data; // Assuming your server returns an array of following
    } catch (error) {
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}

async function removeFollow(user_id, post_user_id) {
    try {
        jsonData = { table: 'Follows', id1: 'follower_user_id', id2: 'following_user_id', id_value_1: user_id, id_value_2: post_user_id };
        await fetch('http://localhost:3000/api/persist/remove_by_2_ids', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(jsonData),
        })
    } catch (error) {
        console.error('Error adding follow:', error);
        return null;
    }
}


// Function to handle unfollowing a user
async function handleRemove(user_id) {
    try {
        const current_user_id = await getCurrentUserId();

        await removeFollow(user_id, current_user_id);
        populateFollowersList();
        alert(`You removed user with ID ${user_id}`);
    } catch (error) {
        console.error(error);
    }
}

// Function to retrieve following data from the server
async function getFollowersData(user_id) {
    try {
        // const current_user_id = await getCurrentUserId();
        const jsonData = { table: "Follows", field: "following_user_id", value: user_id };
        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data; // Assuming your server returns an array of following
    } catch (error) {
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}

// Function to populate the "People Who Follow You" list on the HTML page
async function populateFollowingList() {
    const followingList = document.getElementById('following-list');

    try {
        const current_user_id = await getCurrentUserId();
        const followingData = await getFollowingData(current_user_id);
        const following_data_with_full_name = await addFullName(followingData, "following_user_id");
        const filteredData = following_data_with_full_name.filter(item => item.full_name !== undefined);

        filteredData.sort((a, b) => a.full_name.localeCompare(b.full_name));

        followingList.innerHTML = '';
        filteredData.forEach((user) => {
            let listItem = document.createElement('li');
            listItem.classList.add('following-list-item')
            listItem.textContent = user.full_name;
            const unfollowButton2 = document.createElement('button');
            unfollowButton2.classList.add('following-button')
            unfollowButton2.textContent = 'Unfollow';

            // Attach a click event listener to the "Unfollow" button
            unfollowButton2.addEventListener('click', (event) => {
                const user_id = user.following_user_id;

                removeFollow(current_user_id, user_id); // Pass both userId and userName to the function
                populateFollowingList();
                populateNotFollowUsersList('');
            });
            listItem.textContent = user.full_name;
            listItem.appendChild(unfollowButton2);
            followingList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
    }
}

async function addFullName(data_to_send, field_to_fetch_from) {
    try {
        // const current_user_id = await getCurrentUserId();
        const jsonData = { data: data_to_send, field: field_to_fetch_from };
        const response = await fetch('http://localhost:3000/api/persist/add_full_name', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data; // Assuming your server returns an array of following
    } catch (error) {
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}

// Function to populate the "Your Following List" on the HTML page
async function populateFollowersList() {
    const followersList = document.getElementById('followers-list');
    try {
        const user_id = await getCurrentUserId();
        const followersData = await getFollowersData(user_id);
        const followers_data_with_full_name = await addFullName(followersData, "follower_user_id");
        // Clear any existing list items
        followersList.innerHTML = '';
        // Loop through the followingData and create list items for each user you are following
        followers_data_with_full_name.forEach((user) => {
            const listItem = document.createElement('li');
            listItem.classList.add('followers-list-item');
            listItem.textContent = user.full_name;
            // Create an "Unfollow" button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('followers-button');
            // removeButton.className = "remove-button";

            // Add a data attribute to store the user_id
            removeButton.dataset.userId = user.user_id;

            // Attach a click event listener to the "Unfollow" button
            removeButton.addEventListener('click', (event) => {
                const user_id = user.follower_user_id;
                const userName = user.full_name; // Get the user's full name
                handleRemove(user_id, userName); // Pass both userId and userName to the function
            });

            // Append the nameDiv and "Unfollow" button to the list item
            listItem.appendChild(removeButton);

            // Append the list item to the following list
            followersList.appendChild(listItem);
        });
    } catch (error) {
        alert('Please log in to view the follow page.');
        window.location.href = 'login.html';
    }
}

async function getUsersNotFollow(userId) {
    try {
        const response = await fetch('http://localhost:3000/api/persist/getUsersNotFollow', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data; // Assuming your server returns an array of following
    } catch (error) {
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}

// Function to populate the "Not Following Users List" on the HTML page with autocomplete
// Function to populate the "Not Following Users List" on the HTML page with autocomplete
// Function to populate the "Not Following Users List" on the HTML page with autocomplete
async function populateNotFollowUsersList(searchText) {
    const notfollowingList = document.getElementById('NotFolllowUsersList');
    try {
        const userId = await getCurrentUserId();
        const notfollowingData = await getUsersNotFollow(userId);
        notfollowingData.sort((a, b) => a.full_name.localeCompare(b.full_name));
        // Clear any existing list items
        notfollowingList.innerHTML = '';

        // Loop through the followingData and create list items for each user you are following
        notfollowingData.forEach((user) => {
            // Check if the search text is empty or if it matches the user's name
            if (searchText === '' || user.full_name.toLowerCase().startsWith(searchText.toLowerCase())) {
                let listItem = document.createElement('li');
                listItem.classList.add('not-following-list-item');

                // Create a div to hold the user's name
                listItem.textContent = user.full_name;

                // Create an "Unfollow" button
                const followButton = document.createElement('button');
                followButton.classList.add('not-following-button');
                followButton.textContent = 'Follow';

                // Add a data attribute to store the user_id
                followButton.dataset.userId = user.user_id;

                // Attach a click event listener to the "Unfollow" button
                followButton.addEventListener('click', (event) => {
                    addFollow(userId, user.user_id);
                    populateFollowingList();
                    populateNotFollowUsersList('')
                });

                // Append the nameDiv and "Unfollow" button to the list item
                listItem.appendChild(followButton);

                // Append the list item to the following list
                notfollowingList.appendChild(listItem);
            }
        });
    } catch (error) {
        console.error(error);
    }
}

// Listen for input events on the search bar
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', (event) => {
    const searchText = event.target.value.trim(); // Get the trimmed search text
    populateNotFollowUsersList(searchText); // Pass the search text to the function
});

async function displayAdminButtons() {
    const topBar = document.querySelector('.top-bar');
    const adminButton = document.createElement('button');
    adminButton.textContent = 'Admin Feature';
    adminButton.classList.add('button');

    // Add an event handler for the admin button
    adminButton.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });

    // Append the admin button to the top-bar
    topBar.prepend(adminButton);

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

// Call the populateFollowersList and populateFollowingList functions when the page loads
window.addEventListener('load', async() => {
    populateFollowersList();
    populateFollowingList();
    populateNotFollowUsersList('');
    const user_id = await getCurrentUserId();
    if (user_id == 1) {
        await displayAdminButtons();
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
        // Initially, show the full list
});