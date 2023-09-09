import fetch from 'node-fetch';


const BASE_URL = 'http://localhost:8080';
const testUser = {
    username: 'admin',
    password: 'admin',
};
const testUserId = 26;
const routes = [
    '/api/comments',
    '/api/posts',
    '/api/users',
    '/api/likes',
    '/api/relationships',
];

async function obtainAccessToken() {
    try {
        const response = await fetch(BASE_URL + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser),
        });

        if (response.status === 200) {
            const data = await response.json();
            return data.userToken;
        } else {
            console.error('Login failed. Status:', response.status);
            return null;
        }
    } catch (error) {
        console.error('Error during login:', error);
        return null;
    }
}

async function runTests() {
    console.log('Starting tests...');
    const accessToken = await obtainAccessToken();
    if (accessToken) {
        console.log('user Token obtained:', accessToken);

        for (const route of routes) {
            await testRoute(route, accessToken);
        }
        console.log('All tests completed.');
    } else {
        console.error('Failed to obtain user Token.');
    }
}


async function testRoute(route, accessToken) {
    try {
        const response = await fetch(BASE_URL + route, {
            headers: {
                'Cookie': `userToken=${accessToken}`,
            },
        });
        const data = await response.json();
        if (response.status === 200) {
            console.log(`Test for route ${route} passed.`);
        } else {
            console.error(`Test for route ${route} failed. Status: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error testing route ${route}:`, error);
    }
}

//Login_Route_test
async function testLoginRoute() {
    try {
        const response = await fetch(BASE_URL + '/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser),
        });
        const data = await response.json();
        if (response.status === 200) {
            console.log('Login test passed.');
            if (data.userToken) {
                console.log('User Token obtained:', data.userToken);
            } else {
                console.error('User Token not found in the response.');
            }
        } else {
            console.error('Login test failed. Status:', response.status);
        }
    } catch (error) {
        console.error('Error testing login route:', error);
    }
}

//logout_route_test
async function logoutUser() {
    try {
        const response = await fetch(BASE_URL + `/api/auth/logout?id=${testUserId}`, {
            method: 'POST',
        });
        if (response.status === 200) {
            console.log('User logged out successfully.');
        } else {
            console.error('User logout failed. Status:', response.status);
        }
    } catch (error) {
        console.error('Error logging out user:', error);
    }
}


testLoginRoute();
runTests();
logoutUser();