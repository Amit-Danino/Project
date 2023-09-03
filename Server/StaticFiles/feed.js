// Get the user's country from the cookie
// fix this function. 
//const db = require('../database/db');  //improt db connectoin



function getUserCountry() {
    /*
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'country') {
            return decodeURIComponent(value);
        }
    }
    */
    return 'Afghanistan'; // If the country cookie is not set
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
    return data[0].user_id;
}

// Function to format the post date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Function to display the posts like on Facebook
function displayPosts(posts) {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = '';

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
                        <p>${formatDate(post.post_date)}</p>
                    </div>
                    <p class="post-caption">${post.caption}</p>
                    <p class="post-likes">${post.Likes} Likes ${post.DisLike} DisLikes</p>

                    <div class="post-comments">
                        <ul>Comments:
                            ${post.comment_text ? `<li>${post.comment_text}</li>` : ''}
                        </ul>
                    </div>
                    <div class="post-actions">
                        <div class="comment-input">
                            <input type="text" placeholder="Write your comment here" class="comment-textbox">
                        </div>
                        <br>
                        <button class="add-comment-button">Comment</button>
                        <button class="like-button">Like</button>
                        <button class="cancel-like-button" style="display: none;">Cancel Like</button>
                        <button class="dislike-button">DisLike</button>
                    </div>
                `;
               // Inside your postElement creation block:
                const likeButton = postElement.querySelector('.like-button');
                const dislikeButton = postElement.querySelector('.dislike-button');
                const cancelLikeButton = postElement.querySelector('.cancel-like-button'); // Add this line 

                likeButton.addEventListener('click', async () => {
                    console.log('Like button clicked');
                    const userId = await getCurrentUserId();
                    console.log(userId)
                    const liked = await handleLike(post.post_id, userId);                
                    if (liked) {
                        likeButton.style.display = 'none'; // Hide the Like button
                        cancelLikeButton.style.display = 'inline-block'; // Show the Cancel Like button
                        // Update the displayed like count with the response data
                        const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                        postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${post.DisLike} DisLikes`;
                    }
                });
                
                cancelLikeButton.addEventListener('click', async () => {
                    console.log('Cancel Like button clicked');
                    const canceled = await handleCancelLike(post.post_id, post.user_id);
                    if (canceled) {
                        cancelLikeButton.style.display = 'none'; // Hide the Cancel Like button
                        likeButton.style.display = 'inline-block'; // Show the Like button
                        // Update the displayed like count with the response data
                        const updatedLikeCount = await fetchUpdatedLikeCount(post.post_id);
                        postElement.querySelector('.post-likes').textContent = `${updatedLikeCount} Likes ${post.DisLike} DisLikes`;
                    }
                });
                
                
                // Function to fetch the updated like count from the server
                async function fetchUpdatedLikeCount(postId) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/posts/like-count/${postId}`); // Correctly pass postId in the URL
                        
                        if (response.ok) {
                            const data = await response.json();
                            return data.likeCount; // Return the updated like count
                        } else {
                            throw new Error('Error fetching updated like count');
                        }
                    } catch (error) {
                        console.error('Error fetching updated like count:', error);
                        return null;
                    }
                }
                
                dislikeButton.addEventListener('click', () => {
                    console.log('Dislike button clicked');
                    handleDislike(post.post_id, post.user_id);
                });

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
async function handleLike(post_id, user_id) {
    console.log("asdf",user_id)
    try {
        const response = await fetch('http://localhost:3000/api/posts/like', {
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
            throw new Error('Error liking post');
        }
    } catch (error) {
        console.error('Error liking post:', error);
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
            // Reload the page to reflect the updated state
            window.location.reload();
        } else {
            throw new Error('Error disliking post');
        }
    } catch (error) {
        console.error('Error disliking post:', error);
    }
}




// Fetch and display posts from different countries
const loadFeed = async () => {
    const userCountry = getUserCountry();

    if (!userCountry) {
        // Handle the case where the country cookie is not set
        alert('Please log in to view the feed.');
        window.location.href = 'login.html';
        return;
    }

    try {
        // Fetch posts from the database using your server-side script
        const response = await fetch('http://localhost:3000/api/posts/feed', {
            method: 'POST',
            body: JSON.stringify({ userCountry }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Error fetching posts');
        }

        const posts = await response.json();

        // Display posts like on Facebook
        displayPosts(posts);
    } catch (error) {
        console.error('Error fetching or displaying posts:', error);
    }
};
async function handleCancelLike(postId, userId) {
    try {
        const response = await fetch('http://localhost:3000/api/posts/cancel-like', {
            method: 'POST',
            body: JSON.stringify({ post_id: postId, user_id: userId }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            // Reload the page to reflect the updated state
            window.location.reload();
        } else {
            throw new Error('Error canceling like');
        }
    } catch (error) {
        console.error('Error canceling like:', error);
    }
}

// Load the feed when the page is loaded
window.addEventListener('load', loadFeed);