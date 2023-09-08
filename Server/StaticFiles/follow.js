async function getCurrentUserId() {
    const cookies = document.cookie.split(';');
    let [name, value] = cookies[cookies.length - 1].split('=');
    name = name.split(' ').join('')
    const response = await fetch('http://localhost:3000/api/users/getUserId', {
        method: 'POST',
        body: JSON.stringify({
            email: name
        }), // Make sure you define post_id and user_id
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data[0].user_id;
}


async function handlefollow(user_id) {
    try {
        // Make a fetch request to your server to unfollow the user using their userId
        const current_user_id = await getCurrentUserId();
        const response = await fetch('http://localhost:3000/api/follows/follow', {
            method: 'POST',
            body: JSON.stringify({ user_id: user_id, current_user_id: current_user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // After successfully unfollowing, update the following list
        populateFollowersList();

        // Optionally, display a confirmation message to the user
        // You can use the user's name from the screen if needed
    } catch (error) {
        console.error(error);
    }
}
// Function to retrieve followers data from the server
async function getFollowingData(userId) {
    try {
        const response = await fetch('http://localhost:3000/api/follows/following', {
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
        return data; // Assuming your server returns an array of followers
    } catch (error) {
        console.error(error);
        return []; // Return an empty array in case of an error
    }
}
// Function to handle unfollowing a user
async function handleRemove(userId) {
    try {
        const current_user_id = await getCurrentUserId();

        // Make a fetch request to your server to unfollow the user using their userId
        const response = await fetch('http://localhost:3000/api/follows/remove', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, current_user_id: current_user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // After successfully unfollowing, update the following list
        populateFollowersList();

        // Optionally, display a confirmation message to the user
        // You can use the user's name from the screen if needed
        alert(`You removed user with ID ${userId}`);
    } catch (error) {
        console.error(error);
    }
}

async function handleUnfollow(userId) {
    try {
        const current_user_id = await getCurrentUserId();

        // Make a fetch request to your server to unfollow the user using their userId
        const response = await fetch('http://localhost:3000/api/follows/unfollow', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, current_user_id: current_user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // After successfully unfollowing, update the following list
        populateNotFollowUsersList('');

    } catch (error) {
        console.error(error);
    }
}


// Function to retrieve following data from the server
async function getFollowersData(userId) {
    try {
        const current_user_id = await getCurrentUserId();
        const response = await fetch('http://localhost:3000/api/follows/followers', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, current_user_id: current_user_id }),
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
    const notfollowingList = document.getElementById('NotFolllowUsersList');

    try {
        const userId = await getCurrentUserId();
        const followingData = await getFollowingData(userId);

        followingList.innerHTML = '';

        followingData.forEach((user) => {
            let listItem = document.createElement('li');
            // Assuming that the 'follower' object has a 'full_name' property
            listItem.textContent = user.full_name;
            const unfollowButton2 = document.createElement('button');
            unfollowButton2.textContent = 'Unfollow';
            // Add a data attribute to store the user_id
            unfollowButton2.dataset.userId = user.user_id;
            unfollowButton2.className = "unfollow-button";


            // Attach a click event listener to the "Unfollow" button
            unfollowButton2.addEventListener('click', (event) => {
                const userId = event.target.dataset.userId;
                const userName = user.full_name; // Get the follower's full name
                handleUnfollow(userId, userName); // Pass both userId and userName to the function
                followingList.removeChild(listItem);

                listItem = document.createElement('li');
                listItem.textContent = userName;
                // Assuming that the 'follower' object has a 'full_name' property
                const followButton = document.createElement('button');
                followButton.textContent = 'follow';
                followButton.style.backgroundColor = "#5391f4";
                followButton.style.color = "white";
                followButton.style.border = "none";
                followButton.style.padding = "6px 12px";
                followButton.style.fontSize = "12px";
                // Add a data attribute to store the user_id
                followButton.dataset.userId = user.user_id;
                // Attach a click event listener to the "Unfollow" button
                followButton.addEventListener('click', (event) => {
                    const userId = event.target.dataset.userId;
                    const userName = user.full_name; // Get the follower's full name
                    handlefollow(userId, userName); // Pass both userId and userName to the function
                });
                listItem.appendChild(followButton);
                notfollowingList.appendChild(listItem);


            });
            listItem.textContent = user.full_name;
            listItem.appendChild(unfollowButton2);
            followingList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
    }
}


// Function to populate the "Your Following List" on the HTML page
async function populateFollowersList() {
    const followersList = document.getElementById('followers-list');

    try {
        const userId = await getCurrentUserId();
        const followersData = await getFollowersData(userId);

        // Clear any existing list items
        followersList.innerHTML = '';

        // Loop through the followingData and create list items for each user you are following
        followersData.forEach((user) => {
            const listItem = document.createElement('li');
            listItem.textContent = user.full_name;
            // Create an "Unfollow" button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.className = "remove-button";

            // Add a data attribute to store the user_id
            removeButton.dataset.userId = user.user_id;

            // Attach a click event listener to the "Unfollow" button
            removeButton.addEventListener('click', (event) => {
                const userId = event.target.dataset.userId;
                const userName = user.full_name; // Get the user's full name
                handleRemove(userId, userName); // Pass both userId and userName to the function
            });

            // Append the nameDiv and "Unfollow" button to the list item
            listItem.appendChild(removeButton);

            // Append the list item to the following list
            followersList.appendChild(listItem);

        });
    } catch (error) {
        console.error(error);
    }
}

async function getUsersNotFollow(userId) {
    try {
        const current_user_id = await getCurrentUserId();
        const response = await fetch('http://localhost:3000/api/follows/getUsersNotFollow', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, current_user_id: current_user_id }),
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
    const followinglist = document.getElementById('following-list');
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

                // Create a div to hold the user's name
                listItem.textContent = user.full_name;

                // Create an "Unfollow" button
                const followButton = document.createElement('button');
                followButton.className = "follow-button";
                followButton.textContent = 'Follow';

                // Add a data attribute to store the user_id
                followButton.dataset.userId = user.user_id;

                // Attach a click event listener to the "Unfollow" button
                followButton.addEventListener('click', (event) => {
                    const userId = event.target.dataset.userId;
                    const userName = user.full_name; // Get the user's full name
                    handlefollow(userId);
                    notfollowingList.removeChild(listItem);

                    listItem = document.createElement('li');
                    listItem.textContent = userName;
                    // Assuming that the 'follower' object has a 'full_name' property
                    const unfollowButton2 = document.createElement('button');
                    unfollowButton2.textContent = 'Unfollow';
                    unfollowButton2.style.backgroundColor = "#e74c3c";
                    unfollowButton2.style.color = "white";
                    unfollowButton2.style.border = "none";
                    unfollowButton2.style.padding = "6px 12px";
                    unfollowButton2.style.fontSize = "12px";
                    // Add a data attribute to store the user_id
                    unfollowButton2.dataset.userId = user.user_id;
                    // Attach a click event listener to the "Unfollow" button
                    unfollowButton2.addEventListener('click', (event) => {
                        const userId = event.target.dataset.userId;
                        const userName = user.full_name; // Get the follower's full name
                        handleUnfollow(userId, userName); // Pass both userId and userName to the function
                        followinglist.removeChild(listItem);
                    });
                    listItem.appendChild(unfollowButton2);
                    followinglist.appendChild(listItem);
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

// Call the populateFollowersList and populateFollowingList functions when the page loads
window.addEventListener('load', () => {
    populateFollowersList();
    populateFollowingList();
    populateNotFollowUsersList(''); // Initially, show the full list
});