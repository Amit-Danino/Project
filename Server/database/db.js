const mysql = require('mysql2');

//connect to the db
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'mysqlpassword',
    database: 'world_Link_dataBase',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database!');
    }
});

module.exports = connection;