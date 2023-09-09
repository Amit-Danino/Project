const express = require('express');
const persistRoutes = require("./controllers/persist");


//function that saves the server 
const app = express();

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


const baseUrl = 'http://localhost:3000/api/'; // Update with your server URL


// Define test cases
const routesToTest = [{
    description: 'Test /insert route',
    route: '/controllers/persist/insert', // Update with the correct path to your insert function
    method: 'POST',
    body: {
        table: 'Users', // Update with your table and data
        data: {
            username: "testUser",
            email: "testUser",
            password_hash: "testUser",
            full_name: "testUser",
            bio: "testUser",
            profile_picture_url: "testUser",
            country: "Israel",
            registration_date: "2023-09-09T14:54:49.459Z",
            birth_date: "1996-11-07",
            gender: "male"
        },
    },
    expectedStatus: 200,
}];

// Function to run a test case
async function testRoute(testCase) {
    try {
        console.log(baseUrl + testCase.route);
        const response = await fetch(baseUrl + testCase.route, {
            method: testCase.method,
            body: JSON.stringify(testCase.body),
            headers: { 'Content-Type': 'application/json' },
        });

        const responseBody = await response.json();

        if (response.status === testCase.expectedStatus) {
            console.log(`[PASS] ${testCase.description}`);
        } else {
            console.error(`[FAIL] ${testCase.description}`);
            console.error(`Expected status: ${testCase.expectedStatus}, Actual status: ${response.status}`);
        }
    } catch (error) {
        console.error(`[ERROR] ${testCase.description}`);
        console.error(error);
    }
}

// Run all test cases
async function runAllTestCases() {
    console.log('test')
    for (const testCase of testCases) {
        await testRoute(testCase);
    }
}

// Start running the tests
runAllTestCases();