DROP DATABASE IF EXISTS `world_Link_dataBase`;
CREATE DATABASE `world_Link_dataBase`; 
USE `world_Link_dataBase`;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    bio TEXT,
    profile_picture_url VARCHAR(255),
    country VARCHAR(50),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    birth_date TEXT,
    gender TEXT
);

INSERT INTO Users (user_id, username, email, password_hash, full_name, bio, profile_picture_url, country, birth_date, gender)
VALUES
    (1, 'user1', 'user1@example.com', 'password1hash', 'User One', 'I love photography!', 'profile1.jpg', 'Country A','1990-06-20', 'male'),
    (2, 'user2', 'user2@example.com', 'password2hash', 'User Two', 'Travel enthusiast', 'profile2.jpg', 'Country B','1997-03-11', 'female'),
    (3, 'user3', 'user3@example.com', 'password3hash', 'User Three', 'Foodie and blogger', 'profile3.jpg', 'Country C','1996-05-07', 'other');

CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    caption TEXT,
    image_url VARCHAR(255) NOT NULL,
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

INSERT INTO Posts (post_id, user_id, caption, image_url)
VALUES
    (1, 1, 'Enjoying the sunset!', 'sunset.jpg'),
    (2, 2, 'Exploring new places!', 'travel.jpg'),
    (3, 3, 'Delicious homemade meal!', 'food.jpg');



CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

INSERT INTO Comments (comment_id, user_id, post_id, comment_text)
VALUES
    (1, 2, 1, 'Amazing view!'),
    (2, 1, 2, 'Looks like a great adventure!'),
    (3, 3, 3, 'Yum, recipe please! Looks delicious!');



CREATE TABLE Likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    like_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

INSERT INTO Likes (like_id, user_id, post_id)
VALUES
    (1, 3, 1),
    (2, 2, 2),
    (3, 1, 3);
    
    
CREATE TABLE DisLikes (
    dislike_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    dislike_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

INSERT INTO DisLikes (dislike_id, user_id, post_id)
VALUES
    (1, 3, 1),
    (2, 2, 2),
    (3, 1, 3);



CREATE TABLE Follows (
    follow_id INT PRIMARY KEY,
    follower_user_id INT NOT NULL,
    following_user_id INT NOT NULL,
    follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

INSERT INTO Follows (follow_id, follower_user_id, following_user_id)
VALUES
    (1, 1, 2),
    (2, 2, 3),
    (3, 3, 1);


CREATE TABLE ActivityLog (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM ('login', 'logout', 'post') NOT NULL,
    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

INSERT INTO ActivityLog (log_id, user_id, activity_type, activity_time)
VALUES
    (1, 1, 'login', '2023-07-31 09:12:34'),
    (2, 2, 'post', '2023-07-31 10:45:21'),
    (3, 3, 'logout', '2023-07-31 12:30:15');


CREATE TABLE SuccessStories (
    story_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    story_text TEXT NOT NULL,
    story_date DATE NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


INSERT INTO SuccessStories (story_id, user1_id, user2_id, story_text, story_date)
VALUES
    (1, 1, 2, 'We met through this platform and became travel buddies!', '2023-07-15'),
    (2, 2, 3, 'Found a food blogging partner here. It changed our lives!', '2023-07-20'),
    (3, 1, 3, 'Happily married after meeting on this social media!', '2023-07-25');
