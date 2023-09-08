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


CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    caption TEXT NOT NULL,
    image_url VARCHAR(255),
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);




CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);



CREATE TABLE Likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    like_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);

    
CREATE TABLE DisLikes (
    dislike_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    dislike_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON DELETE CASCADE
);



CREATE TABLE Follows (
    follow_id INT PRIMARY KEY AUTO_INCREMENT,
    follower_user_id INT NOT NULL,
    following_user_id INT NOT NULL,
    follow_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (following_user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE ActivityLog (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM ('login', 'logout', 'post') NOT NULL,
    activity_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);



CREATE TABLE SuccessStories (
    story_id INT AUTO_INCREMENT PRIMARY KEY,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    story_text TEXT NOT NULL,
    story_date DATE NOT NULL,
    FOREIGN KEY (user1_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES Users(user_id) ON DELETE CASCADE
);


CREATE TABLE features (
    feature_name VARCHAR(255) NOT NULL UNIQUE,
    feature_status ENUM('enabled', 'disabled') NOT NULL
);




INSERT INTO features (feature_name, feature_status) VALUES
    ('dislikes', 'enabled'),
    ('comments', 'enabled'),
    ('successStories', 'enabled'),
    ('aboutMe', 'enabled');
    
INSERT INTO Users (username, email, password_hash, full_name, bio, profile_picture_url, country, birth_date, gender)
VALUES
    ('admin', 'admin', 'admin', 'admin admin', 'Foodie and blogger', 'profile3.jpg', 'Israel','1996-11-07', 'male'),
    ('john_doe', 'john@example.com', 'johnpassword', 'John Doe', 'I love photography!', 'profile1.jpg', 'USA', '1990-06-20', 'male'),
    ('hagar_traveler', 'hagar@example.com', 'hagarpassword', 'Hagar Yulevich', 'Travel enthusiast', 'profile2.jpg', 'Afghanistan', '1997-03-11', 'female'),
    ('elad_foodie', 'elad@example.com', 'eladpassword', 'Elad Ozer', 'Foodie and blogger', 'profile3.jpg', 'Croatia', '1996-05-07', 'other'),
    ('sara_photography', 'sara@example.com', 'sarapassword', 'Sara Smith', 'Photographer', 'profile4.jpg', 'Canada', '1985-09-15', 'female'),
    ('mike_traveler', 'mike@example.com', 'mikepassword', 'Mike Johnson', 'Travel enthusiast', 'profile5.jpg', 'USA', '1992-02-28', 'male'),
    ('rachel_foodie', 'rachel@example.com', 'rachelpassword', 'Rachel Green', 'Foodie and chef', 'profile6.jpg', 'France', '1988-12-03', 'female'),
    ('david_outdoor', 'david@example.com', 'davidpassword', 'David Miller', 'Outdoor enthusiast', 'profile7.jpg', 'Australia', '1994-07-10', 'male'),
    ('linda_nature', 'linda@example.com', 'lindapassword', 'Linda Davis', 'Nature lover', 'profile8.jpg', 'Canada', '1983-04-22', 'female'),
    ('peter_music', 'peter@example.com', 'peterpassword', 'Peter Walker', 'Musician and composer', 'profile9.jpg', 'USA', '1990-03-19', 'male');

INSERT INTO Posts (user_id, caption, image_url)
VALUES
    (2, 'Exploring the world, one adventure at a time. #Wanderlust #Traveler #Adventure', 'travel1.jpg'),
    (3, 'Delicious homemade pizza for dinner tonight. Here is the recipe! #Foodie #Cooking', 'pizza1.jpg'),
    (4, 'Capturing the beauty of nature in its purest form. #NaturePhotography #Wilderness', 'nature1.jpg'),
    (5, 'Creating soul-touching music with every note. #Music #Composer', 'music1.jpg'),
    (6, 'Sunset views that take your breath away. #SunsetLovers #Nature', 'sunset1.jpg'),
    (7, 'French cuisine at its finest. Bon appétit! #FrenchCuisine #Foodie', 'french_cuisine1.jpg'),
    (8, 'Camping under the starry night sky. #Camping #Adventure', 'camping1.jpg'),
    (9, 'Nature\'s symphony - birds, rivers, and trees. #NatureLover #Outdoors', 'nature2.jpg'),
    (10, 'Exploring historical landmarks and their stories. #History #Travel', 'landmarks1.jpg'),
    (2, 'Making memories that last a lifetime. #AdventureTime #TravelGoals', 'travel2.jpg');

INSERT INTO Comments (user_id, post_id, comment_text)
VALUES
    (3, 1, 'Amazing sunset view! I wish I could be there right now.'),
    (4, 2, 'This adventure looks incredible! How did you find this place?'),
    (5, 3, 'That pizza looks mouthwatering! Can you share the recipe, please?'),
    (6, 4, 'The beauty of nature is awe-inspiring. Great shot!'),
    (7, 5, 'Your music touches my soul. Keep creating!'),
    (8, 6, 'I adore French cuisine. What dish is that?'),
    (9, 7, 'Camping under the stars must be magical. Tell me more!'),
    (10, 8, 'Nature\'s beauty is unparalleled, and you capture it perfectly.'),
    (2, 9, 'Your music is inspiring. Do you have any upcoming concerts?'),
    (4, 10, 'These landmarks have so much history. Which one is your favorite?');

INSERT INTO Likes (user_id, post_id)
VALUES
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (9, 9),
    (10, 10);

INSERT INTO DisLikes (user_id, post_id)
VALUES
    (2, 1),
    (3, 2),
    (4, 3),
    (5, 4),
    (6, 5),
    (7, 6),
    (8, 7),
    (9, 8),
    (10, 9),
    (1, 10);

INSERT INTO Follows (follower_user_id, following_user_id)
VALUES
    (1, 2),
    (2, 3),
    (3, 4),
    (4, 5),
    (5, 6),
    (6, 7),
    (7, 8),
    (8, 9),
    (9, 10),
    (10, 1);

INSERT INTO ActivityLog (user_id, activity_type)
VALUES
    (1, 'login'),
    (2, 'login'),
    (3, 'login'),
    (4, 'login'),
    (5, 'login'),
    (6, 'login'),
    (7, 'login'),
    (8, 'login'),
    (9, 'login'),
    (10, 'login');

INSERT INTO SuccessStories (user1_id, user2_id, story_text, story_date)
VALUES
    (1, 2, 'We met through this platform and became travel buddies! #TravelBuddies', '2023-08-01'),
    (2, 3, 'Found a food blogging partner here. It changed our lives! #FoodBloggers', '2023-08-05'),
    (3, 4, 'Happily married after meeting on this social media! #LoveStory', '2023-08-10'),
    (4, 5, 'Our photography journey began here, and it keeps getting better! #PhotographyJourney', '2023-08-12'),
    (5, 6, 'Music brought us together, and we\'ve been making beautiful music ever since! #Musicians', '2023-08-15'),
    (6, 7, 'Exploring the culinary world, one dish at a time. #FoodiesForLife', '2023-08-20'),
    (7, 8, 'Nature lovers who found their paradise on this platform. #NatureLovers', '2023-08-25'),
    (8, 9, 'Our outdoor adventures started here, and they are still going strong! #AdventureTime', '2023-08-30'),
    (9, 10, 'History buffs exploring the world\'s wonders together. #HistoryExplorers', '2023-09-01'),
    (10, 1, 'From different worlds to a world of our own. #LoveKnowsNoBounds', '2023-09-05');

    
