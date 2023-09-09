const express = require('express');

const persistRoutes = require("./controllers/persist");

//function that saves the server 
const app = express();
const port = 3000;

//get the html file
app.use(express.static('StaticFiles'));

//activate the server
app.use(express.json());

//adding the header to every call to the server expet from the previous one
// Setting CORS Headers to every response of the server
app.use((req, res, next) => {
    res.setHeader(
        "Access-Control-Allow-Origin", "*"
    ); // * => this is the domain
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    );
    next();
});


//routes - routes the requests to the server

app.use(`/api/persist`, persistRoutes);


//open html file - later on maybe change to home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/StaticFiles/home.html');
})

//in the first run of the server  - the server will listen to the request in port port.
app.listen(port, () => {
    console.log(`Server is listening to requests in http://localhost:${port}`);
});