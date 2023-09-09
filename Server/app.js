//import express , mysql library, userRountes
const express = require('express');
const usersRoutes = require("./routes/users-routes");
const postsRoutes = require("./routes/posts-routes");
const commentsRoutes = require("./routes/comments-routes");
const successstoriesRoutes = require("./routes/successstories-routes");
const activitylogRoutes = require("./routes/activitylog-routes");
const followsRoutes = require("./routes/follows-routes");
const likesRoutes = require("./routes/likes-routes");
const featureRoutes = require("./routes/feature-routes");

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
app.use(`/api/users`, usersRoutes);
app.use(`/api/posts`, postsRoutes);
app.use(`/api/comments`, commentsRoutes);
app.use(`/api/successstories`, successstoriesRoutes);
app.use(`/api/activitylog`, activitylogRoutes);
app.use(`/api/follows`, followsRoutes);
app.use(`/api/likes`, likesRoutes);
app.use(`/api/feature`, featureRoutes);

app.use(`/api/persist`, persistRoutes);


//TODO:
//open html file - later on maybe change to home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/StaticFiles/home.html');
})

//in the first run of the server  - the server will listen to the request in port port.
app.listen(port, () => {
    console.log(`Server is listening to requests in http://localhost:${port}`);
});