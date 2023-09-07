// Get the user's country from the cookie
// fix this function. 
//const db = require('../database/db');  //improt db connectoin



async function getUserCountry(userId) {
    const response = await fetch('http://localhost:3000/api/users/getUserCountry', {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }), // Make sure you define post_id and user_id
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
// Function to display the posts like on Facebook
function displayPosts(posts) {
    const feedContainer = document.getElementById('feed');
    // feedContainer.innerHTML = '';
    if (posts.length === 0) {
        feedContainer.textContent = 'No posts available from other countries.';
    } else {
        let currentPost = null;
        posts.forEach(post => {
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
                addCountry(post.user_id, postElement)

                // Inside your postElement creation block:
                const likeButton = postElement.querySelector('.like-button');
                const dislikeButton = postElement.querySelector('.dislike-button');
                const cancelLikeButton = postElement.querySelector('.cancel-like-button'); // Add this line 
                const cancelDislikeButton = postElement.querySelector('.cancel-dislike-button');
                likeAndDislikeButtonVisibility(post.user_id);

                const postButton = postElement.querySelector('.post-button');
                const commentTextBox = postElement.querySelector('.comment-textbox');
                const logoutButton = document.getElementById('logoutButton');




                async function likeAndDislikeButtonVisibility(post_user_id) {
                    if (await checkIfAlreadyLikedPost(post_user_id)) {
                        likeButton.click();
                    }
                    if (await checkIfAlreadyDislikedPost(post_user_id)) {
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
                    const jsonData = { post_id: post_id, user_id: user_id, boxContent: boxContent }
                    addComment(jsonData)
                    const full_name = await getUserFullname(user_id);
                    const post_comments_ul = postElement.querySelector('.post-comments ul');
                    const newLi = document.createElement('li');
                    newLi.textContent = full_name + ": " + boxContent;
                    post_comments_ul.appendChild(newLi)
                })

                likeButton.addEventListener('click', async() => {
                    console.log('Like button clicked');
                    const userId = await getCurrentUserId();
                    const liked = await handleLike(post.post_id, userId);
                    if (liked) {
                        likeButton.style.display = 'none'; // Hide the Like button
                        cancelLikeButton.style.display = 'inline-block'; // Show the Cancel Like button
                        cancelLikeButton.style.backgroundColor = "lightBlue";

                        // Update the displayed like count with the response data
                        const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                        const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                        postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;

                        if (dislikeButton.style.display === 'none') {
                            cancelDislikeButton.click();
                        }
                    }
                });

                cancelLikeButton.addEventListener('click', async() => {
                    console.log('Cancel Like button clicked');
                    const userId = await getCurrentUserId();
                    const canceled = await handleCancelLike(post.post_id, userId);
                    if (canceled) {
                        cancelLikeButton.style.display = 'none'; // Hide the Cancel Like button
                        likeButton.style.display = 'inline-block'; // Show the Like button
                        // Update the displayed like count with the response data
                        const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                        const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                        postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;
                    }
                });

                dislikeButton.addEventListener('click', async() => {
                    console.log('Dislike button clicked');
                    const userId = await getCurrentUserId();
                    const disliked = await handleDislike(post.post_id, userId);
                    if (disliked) {
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
                    }
                });
                cancelDislikeButton.addEventListener('click', async() => {
                    console.log('Cancel dislike button clicked');
                    const userId = await getCurrentUserId();
                    const canceled = await handleCancelDislike(post.post_id, userId);
                    if (canceled) {
                        cancelDislikeButton.style.display = 'none'; // Hide the Cancel Like button
                        dislikeButton.style.display = 'inline-block'; // Show the Like button
                        // Update the displayed like count with the response data
                        const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                        const updatedDislikeCount = await fetchUpdatedDislikeCount(post.post_id);
                        postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${updatedDislikeCount} DisLikes`;
                    }
                });
                async function checkIfAlreadyDislikedPost(post_user_id) {
                    try {
                        const user_id = await getCurrentUserId();
                        jsonData = { user_id: user_id, post_user_id: post_user_id };
                        const response = await fetch('http://localhost:3000/api/likes/checkIfUserDislikes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        })
                        if (response.ok) {
                            const data = await response.json();
                            console.log(data.length)
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
                        jsonData = { user_id: user_id, post_user_id: post_user_id };
                        console.log(jsonData)
                        const response = await fetch('http://localhost:3000/api/likes/checkIfUserLikes', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        })
                        if (response.ok) {
                            const data = await response.json();
                            console.log("length:", data.length)
                            return data.length > 0;
                        } else {
                            throw new error('Unable to add follow')
                        }
                    } catch (error) {
                        console.error('Error adding follow:', error);
                        return false;
                    }
                }
                // Function to fetch the updated like count from the server
                async function fetchUpdatedLikeCount(postId) {
                    try {
                        jsonData = { post_id: postId }
                        const response = await fetch('http://localhost:3000/api/posts/like-count', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return data; // Return the updated like count
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
                        jsonData = { post_id: postId }
                        const response = await fetch('http://localhost:3000/api/posts/dislike-count', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(jsonData),
                        });
                        if (response.ok) {
                            const data = await response.json();
                            return data; // Return the updated like count
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
        const response = await fetch('http://localhost:3000/api/users/getUserFullname', {
            method: 'POST',
            body: JSON.stringify({ user_id: user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            data = await response.json()
            return data[0].full_name; // Indicate success
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
        const response = await fetch('http://localhost:3000/api/comments/getCommentsFromPost', {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const postCommentsDiv = postElement.querySelector('.post-comments');
            const ulElement = document.createElement('ul'); // Use document.createElement to create a new <ul> element

            data.forEach(async comment => {
                // console.log(comment.user_id)
                const full_name = await getUserFullname(comment.user_id)

                const liElement = document.createElement('li'); // Use document.createElement to create a new <li> element
                liElement.textContent = full_name + ": " + comment.comment_text;
                ulElement.appendChild(liElement);
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

async function addComment(jsonData) {
    try {
        const response = await fetch('http://localhost:3000/api/comments/addComment', {
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
        const response = await fetch('http://localhost:3000/api/posts/like', {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id, user_id: user_id }),
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

async function handleDislike(post_id, user_id) {
    try {
        const response = await fetch('http://localhost:3000/api/posts/dislike', {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id, user_id: user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            //  location.reload(); // or window.location.reload();
            return true; // Indicate success
        } else {
            throw new Error('Error disliking post');
        }
    } catch (error) {
        console.error('Error disliking post:', error);
    }
}

async function handleCancelLike(post_id, user_id) {
    try {
        const response = await fetch('http://localhost:3000/api/posts/cancel-like', {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id, user_id: user_id }),
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
        const response = await fetch('http://localhost:3000/api/posts/cancel-dislike', {
            method: 'POST',
            body: JSON.stringify({ post_id: post_id, user_id: user_id }),
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
        try {
            const response = await fetch('http://localhost:3000/api/posts/addPost', {
                method: 'POST',
                body: JSON.stringify({ caption: caption, user_id: user_id }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Errorz adding post');
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
        const userCountry = getUserCountry(user_id);
        // Fetch posts from the database using your server-side script
        const response = await fetch('http://localhost:3000/api/posts/feed', {
            method: 'POST',
            body: JSON.stringify({ user_id }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching posts');
        }

        const posts = await response.json();

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