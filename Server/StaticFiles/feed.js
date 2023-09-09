// Get the user's country from the cookie
// fix this function. 
//const db = require('../database/db');  //improt db connectoin



async function getUserCountry(user_id) {
    const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
        method: 'POST',
        body: JSON.stringify({ table: "Users", field: 'user_id', value: user_id }), // Make sure you define post_id and user_id
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data[0].country;
}

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


// Function to format the post date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
// Function to display the posts like on Facebook
function displayPosts(posts) {
    const feedContainer = document.getElementById('feed');
    if (posts.length === 0) {
        feedContainer.textContent = 'No posts available from other countries.';
    } else {
        let currentPost = null;
        posts.forEach(async post => {
            if (!currentPost || currentPost.post_id !== post.post_id) {
                // Start a new post
                currentPost = post;
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <div class="post-header">
                        <h3>${post.full_name}</h3>
                        <p class="date">${formatDate(post.post_date)}</p>
                        <p class="country"> </p>
                    </div>
                    
                    <p class="post-caption">${post.caption}</p>
                    <div class="post-comments">          </div>
                    <p class="post-likes">      </p>
                    <br>
                    <div class="post-actions">
                        <button class="like-button">Like</button>
                        <button class="cancel-like-button" style="display: none;">Like</button>
                        <button class="dislike-button">DisLike</button>
                        <button class="cancel-dislike-button" style="display: none;">Dislike</button>
                    </div>
                    <div class="comment-input">
                    <input type="text" placeholder="Write your comment here" class="comment-textbox" maxlength="300">
                    <button class="post-button">Comment</button>

                </div>
                `;

                addCommentsToPost(post.post_id, postElement);
                addLikesAndDislikesToPost(post.post_id, postElement);
                addCountry(post.user_id, postElement);

                const likeButton = postElement.querySelector('.like-button');
                const dislikeButton = postElement.querySelector('.dislike-button');
                const cancelLikeButton = postElement.querySelector('.cancel-like-button'); // Add this line 
                const cancelDislikeButton = postElement.querySelector('.cancel-dislike-button');

                likeAndDislikeButtonVisibility(post.post_id);

                const postButton = postElement.querySelector('.post-button');
                const commentTextBox = postElement.querySelector('.comment-textbox');
                const logoutButton = document.getElementById('logoutButton');

                bonusFeaturesVisibility();

                async function bonusFeaturesVisibility() {
                    const data = await getFeatureData();
                    if (getStatus(data, 'dislikes') == 'disabled') {
                        dislikeButton.style.display = 'none';
                        dislikeButton.disabled = true;
                    }
                    if (getStatus(data, 'comments') == 'disabled') {
                        const commentInput = postElement.querySelector('.comment-input');
                        commentInput.style.display = 'none';
                    }
                    if (getStatus(data, 'successStories') == 'disabled') {
                        const linkElement = document.querySelector('a[href="SuccessStories.html"]');
                        linkElement.style.display = 'none';
                    }
                    if (getStatus(data, 'aboutMe') == 'disabled') {
                        const linkElement = document.querySelector('a[href="About.html"]');
                        linkElement.style.display = 'none';
                    }
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

                async function getFeatureData() {
                    return fetch('http://localhost:3000/api/persist/get_table_data', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ table: 'features' })
                    })

                    .then(async(response) => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            const data = await response.json();
                            return data; // You can use response.json() if the server sends JSON back
                        })
                        .catch((error) => {
                            console.error('There was a problem with the fetch operation:', error);
                        });
                }

                async function likeAndDislikeButtonVisibility(post_id) {
                    if (await checkIfAlreadyLikedPost(post_id)) {
                        likeButton.click();
                    }
                    if (await checkIfAlreadyDislikedPost(post_id)) {
                        dislikeButton.click();
                    }
                }

                logoutButton.addEventListener('click', async() => {
                    const user_id = await getCurrentUserId();
                    const pastDate = new Date();
                    pastDate.setTime(pastDate.getTime() - (1 * 24 * 60 * 60 * 1000));
                    document.cookie = 'logout=logout;expires=' + pastDate.toUTCString() + ';path=/';
                    document.cookie = 'logout=logout;path=/';
                    addActivity(user_id, 'logout');
                })

                postButton.addEventListener('click', async() => {
                    const boxContent = commentTextBox.value;
                    if (isWhitespace(boxContent)) return;
                    commentTextBox.value = ''
                    const post_id = post.post_id
                    const user_id = await getCurrentUserId();
                    const jsonData = { post_id: post_id, user_id: user_id, comment_text: boxContent }
                    addComment(jsonData)
                    const full_name = await getUserFullname(user_id);
                    const post_comments_ul = postElement.querySelector('.post-comments ul');
                    const newLi = document.createElement('li');
                    newLi.textContent = full_name + ": " + boxContent;
                    post_comments_ul.appendChild(newLi)
                })

                likeButton.addEventListener('click', async() => {
                    const userId = await getCurrentUserId();
                    await handleLike(post.post_id, userId);
                    likeButton.style.display = 'none'; // Hide the Like button
                    cancelLikeButton.style.display = 'inline-block'; // Show the Cancel Like button
                    cancelLikeButton.style.backgroundColor = "lightBlue";

                    // Update the displayed like count with the response data
                    const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                    const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                    postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;

                    if (dislikeButton.style.display === 'none' && dislikeButton.disabled == false) {
                        cancelDislikeButton.click();
                    }
                });

                cancelLikeButton.addEventListener('click', async() => {
                    const userId = await getCurrentUserId();
                    await handleCancelLike(post.post_id, userId);

                    cancelLikeButton.style.display = 'none'; // Hide the Cancel Like button
                    likeButton.style.display = 'inline-block'; // Show the Like button
                    // Update the displayed like count with the response data
                    const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                    const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                    postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;

                });

                dislikeButton.addEventListener('click', async() => {
                    const userId = await getCurrentUserId();
                    await handleDislike(post.post_id, userId);

                    dislikeButton.style.display = 'none'; // Hide the Like button
                    cancelDislikeButton.style.display = 'inline-block'; // Show the Cancel Like button
                    cancelDislikeButton.style.backgroundColor = "lightBlue";

                    // Update the displayed like count with the response data
                    const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                    const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                    postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;
                    if (likeButton.style.display === 'none') {
                        cancelLikeButton.click();
                    }

                });
                cancelDislikeButton.addEventListener('click', async() => {
                    const userId = await getCurrentUserId();
                    await handleCancelDislike(post.post_id, userId);

                    cancelDislikeButton.style.display = 'none'; // Hide the Cancel Like button
                    dislikeButton.style.display = 'inline-block'; // Show the Like button
                    // Update the displayed like count with the response data
                    const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                    const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                    postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;

                });

                async function checkIfAlreadyDislikedPost(post_user_id) {
                    try {
                        const user_id = await getCurrentUserId();
                        jsonData = { table: "DisLikes", field1: "user_id", field2: "post_id", value1: user_id, value2: post_user_id };
                        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id_2_values', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        })
                        if (response.ok) {
                            const data = await response.json();
                            return data.length > 0;
                        } else {
                            throw new error('Unable to add follow')
                        }
                    } catch (error) {
                        console.error('Error adding follow:', error);
                        return false;
                    }
                }

                async function checkIfAlreadyLikedPost(post_user_id) {
                    try {
                        const user_id = await getCurrentUserId();
                        jsonData = { table: "Likes", field1: "user_id", field2: "post_id", value1: user_id, value2: post_user_id };
                        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id_2_values', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        })
                        if (response.ok) {
                            const data = await response.json();
                            return data.length > 0;
                        } else {
                            throw new error('Unable to add follow')
                        }
                    } catch (error) {
                        console.error('Error adding follow:', error);
                        return false;
                    }
                }

                //     // Function to fetch the updated like count from the server
                async function fetchUpdatedLikeCount(postId) {
                    try {
                        jsonData = { table: "Likes", field: "post_id", value: postId }
                        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return data.length; // Return the updated like count
                        } else {
                            throw new Error('Error fetching updated like count');
                        }
                    } catch (error) {
                        console.error('Error fetching updated like count:', error);
                        return null;
                    }
                }
                async function fetchUpdatedDislikeCount(postId) {
                    try {
                        jsonData = { table: "DisLikes", field: "post_id", value: postId }
                        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return data.length; // Return the updated like count
                        } else {
                            throw new Error('Error fetching updated like count');
                        }
                    } catch (error) {
                        console.error('Error fetching updated like count:', error);
                        return null;
                    }
                }

                async function addLikesAndDislikesToPost(post_id, postElement) {
                    const updatedLikeCount = await fetchUpdatedLikeCount(post_id);
                    const updatedDislikeCount = await fetchUpdatedDislikeCount(post_id);
                    const postCommentsDiv = postElement.querySelector('.post-likes');
                    postCommentsDiv.textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;
                }
                feedContainer.appendChild(postElement);
            } else {
                // Add comments to the current post
                const postCommentsElement = feedContainer.querySelector('.post:last-child .post-comments ul');
                if (postCommentsElement && post.comment_text) {
                    postCommentsElement.innerHTML += `<li>${post.comment_text}</li>`;
                }
            }
        });
    }
}

async function addCountry(user_Id, postElement) {
    const country = await getUserCountry(user_Id);
    const countryElement = postElement.querySelector('.country');
    countryElement.textContent = "Country: " + country;
}

async function getUserFullname(user_id) {
    try {
        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
            method: 'POST',
            body: JSON.stringify({ table: 'Users', field: 'user_id', value: user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            data = await response.json()
            try {
                return data[0].full_name; // Indicate success
            } catch (error) {
                return undefined;
            }
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }

}
async function addCommentsToPost(post_id, postElement) {
    try {
        const response = await fetch('http://localhost:3000/api/persist/get_table_data_id', {
            method: 'POST',
            body: JSON.stringify({ table: 'Comments', field: 'post_id', value: post_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const postCommentsDiv = postElement.querySelector('.post-comments');
            const ulElement = document.createElement('ul'); // Use document.createElement to create a new <ul> element

            data.forEach(async comment => {
                const full_name = await getUserFullname(comment.user_id)
                if (full_name != undefined) {
                    const liElement = document.createElement('li'); // Use document.createElement to create a new <li> element
                    liElement.textContent = full_name + ": " + comment.comment_text;
                    ulElement.appendChild(liElement);
                }
            });

            postCommentsDiv.appendChild(ulElement);

            return data; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

async function addComment(comment) {
    try {
        const jsonData = { table: 'Comments', data: comment }
        const response = await fetch('http://localhost:3000/api/persist/insert', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            return true; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

async function handleLike(post_id, user_id) {
    try {
        const jsonData = { table: "Likes", data: { post_id: post_id, user_id: user_id, like_date: new Date() } }
        const response = await fetch('http://localhost:3000/api/persist/insertLikeIfNotExists', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.response; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

async function handleDislike(post_id, user_id) {
    try {
        const jsonData = { table: "DisLikes", data: { post_id: post_id, user_id: user_id, like_date: new Date() } }
        const response = await fetch('http://localhost:3000/api/persist/insertLikeIfNotExists', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data.response; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

async function handleCancelLike(post_id, user_id) {
    try {
        const jsonData = { table: 'Likes', id1: 'user_id', id2: 'post_id', id_value_1: user_id, id_value_2: post_id };

        const response = await fetch('http://localhost:3000/api/persist/remove_by_2_ids', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            //  location.reload(); // or window.location.reload();
            return true; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

async function handleCancelDislike(post_id, user_id) {
    try {
        const jsonData = { table: 'DisLikes', id1: 'user_id', id2: 'post_id', id_value_1: user_id, id_value_2: post_id };

        const response = await fetch('http://localhost:3000/api/persist/remove_by_2_ids', {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            return true; // Indicate success
        } else {
            throw new Error('Errorz liking post');
        }
    } catch (error) {
        console.error('Errors liking post:', error);
        return false; // Indicate error
    }
}

function isWhitespace(str) {
    return /^\s*$/.test(str);
}

async function displayPostForm() {
    const feedContainer = document.getElementById('feed');
    feedContainer.textContent = ''
        // Create a div element to contain the post form
    const postFormContainer = document.createElement('div');
    postFormContainer.classList.add('post-form');

    // Create a text input for the post content
    const postInput = document.createElement('textarea');
    postInput.setAttribute('placeholder', 'What\'s on your mind?');
    postInput.classList.add('post-input');
    postInput.setAttribute('rows', '3');
    postInput.setAttribute('cols', '50');
    postInput.style.resize = 'none';

    postInput.addEventListener('input', () => {
        const characterCount = postInput.value.length;
        if (characterCount > 300) {
            postInput.value = postInput.value.slice(0, 300);
        }
    });

    const inputContainer = document.createElement('div');
    const postButton = document.createElement('button');
    postButton.textContent = 'Post';
    postButton.classList.add('post-button');

    postButton.addEventListener('click', async() => {
        const caption = postInput.value;
        if (isWhitespace(caption)) return;
        postInput.value = ''
        const user_id = await getCurrentUserId();
        const full_name = await getUserFullname(user_id);
        try {
            const jsonData = { table: "Posts", data: { user_id: user_id, caption: caption, image_url: "landmarks1.jpg", post_date: new Date(), full_name: full_name } }
            const response = await fetch('http://localhost:3000/api/persist/insert', {
                method: 'POST',
                body: JSON.stringify(jsonData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                // Reload the page if the request was successful
                window.location.reload();
            } else {
                // Handle the error condition appropriately
                console.error('Error in inserting data:', response.statusText);
            }
        } catch (error) {
            console.error('Errors adding post:', error);
            return false;
        }
        addActivity(user_id, 'post');
    });

    // Append the text input and button to the post form container
    inputContainer.appendChild(postInput);
    inputContainer.appendChild(postButton);

    postFormContainer.appendChild(inputContainer);

    // Append the post form container to the feed container
    feedContainer.appendChild(postFormContainer);
}

async function displayAdminButtons() {
    const topBar = document.querySelector('.top-bar');
    const adminButton = document.createElement('button');
    adminButton.textContent = 'Admin Feature';
    adminButton.classList.add('button');

    // Add an event handler for the admin button
    adminButton.addEventListener('click', () => {
        // Perform the admin-specific action here
        window.location.href = 'admin.html';
        // You can replace the alert with your admin feature logic
    });

    // Append the admin button to the top-bar
    topBar.prepend(adminButton);

}

// Fetch and display posts from different countries
const loadFeed = async() => {
    try {
        const user_id = await getCurrentUserId()
            // const userCountry = await getUserCountry(user_id);

        // Fetch posts from the database using your server-side script
        const response = await fetch('http://localhost:3000/api/persist/feed', {
            method: 'POST',
            body: JSON.stringify({ user_id: user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            console.log("ERROR")
            throw new Error('Error fetching posts');
        }
        const posts = await response.json();
        console.log(posts);
        // Display posts like on Facebook
        displayPostForm();
        displayPosts(posts);
        if (user_id == 1) {
            displayAdminButtons();
        }
    } catch (error) {
        alert('Please log in to view the feed.');
        window.location.href = 'login.html';
    }
};

// Load the feed when the page is loaded
// window.addEventListener('load', loadFeed);