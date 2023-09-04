const bcrypt = require('bcrypt'); // npm install bcrypt
const db = require('../database/db'); //improt db connectoin


const register = async(req, res) => {
    console.log(req.body);

    const {
        firstname,
        lastname,
        password,
        email,
        bio,
        profile_picture_url,
        country,
        birth_date,
        gender,
    } = req.body;

    const password_hash = encryptPassFunc(password);
    const username = `${firstname}_${lastname}`; // Generate a username based on first and last name

    const user = {
        username,
        email,
        password_hash, // You can hash the password here using a library like bcrypt
        full_name: `${firstname} ${lastname}`,
        bio,
        profile_picture_url,
        country,
        birth_date,
        gender,
    };

    db.query('INSERT INTO Users SET ?', user, (err, results, fields) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).json({ error: 'Error registering user', details: err.message });
        } else {
            console.log('User registered successfully!');
            res.status(201).json({ message: 'User registered successfully!' });
        }
    });

};

// used to encrypt the password before uploading to database
const encryptPassFunc = (password) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const encryptPass = async(req, res) => {
    try {
        const body = req.body;
        const hashed_password = body.password_hashed
        const password = body.passwordToHash;
        bcrypt.compare(password, hashed_password, (err, result) => {
            if (err) {
                // Handle the error (e.g., log it or return an error response)
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Internal Server Error' });
            } else if (result) {
                // Passwords match, authentication is successful
                console.log('Password is correct');
                console.log({ success: true, message: 'Authentication successful' })
                return res.status(200).json({ success: true, message: 'Authentication successful' });
            } else {
                // Passwords do not match, authentication failed
                return res.status(200).json({ success: false, message: 'Invalid email or password' });
            }
        });
    } catch (error) {
        console.error('Error encrypting password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const allUsers = async(req, res) => {
    try {
        const users = await db.promise().query(
            'SELECT * FROM users'
        );
        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Error in allUsers function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUserId = async(req, res) => {
    try {
        const email = req.body.email
        const users = await db.promise().query(
            'SELECT user_id FROM users where email = ?', [email]
        );
        res.status(200).json(users[0]);
    } catch (error) {
        console.error('Error in allUsers function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getUserCountry = async(req, res) => {
    try {
        const user_id = req.body.user_id
        const country = await db.promise().query(
            'SELECT country FROM users where user_id = ?', [user_id]
        );
        res.status(200).json(country[0]);
    } catch (error) {
        console.error('Error in fetching user country function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const getUserFullname = async(req, res) => {
    try {
        const user_id = req.body.user_id
        const country = await db.promise().query(
            'SELECT full_name FROM users where user_id = ?', [user_id]
        );
        res.status(200).json(country[0]);
    } catch (error) {
        console.error('Error in fetching user country function:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    register,
    allUsers,
    encryptPass,
    getUserId,
    getUserCountry,
    getUserFullname
};