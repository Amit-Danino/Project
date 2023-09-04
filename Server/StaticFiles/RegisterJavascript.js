// JavaScript to validate the form on submission
const form = document.getElementById("signupForm");


// JavaScript to add event listeners to track visited (focused) textboxes
const textboxes = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
textboxes.forEach((textbox) => {
    textbox.addEventListener('focus', () => {
        textbox.classList.add('visited');
    });

    textbox.addEventListener('blur', () => {
        textbox.classList.remove('visited');
        if (!textbox.value.trim()) {
            textbox.classList.add('highlight-visited');
        }
    });
});

// JavaScript to dynamically generate options for birthYear dropdown
document.addEventListener("DOMContentLoaded", function() {
    const birthYearDropdown = document.getElementById("birthYear");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1920; year--) {
        const option = document.createElement("option");
        option.text = year;
        option.value = year;
        birthYearDropdown.add(option);
    }

    // JavaScript to dynamically generate options for birthMonth dropdown
    const birthMonthDropdown = document.getElementById("birthMonth");
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    for (let i = 0; i < months.length; i++) {
        const option = document.createElement("option");
        option.text = months[i];
        option.value = months[i];
        birthMonthDropdown.add(option);
    }

    // JavaScript to dynamically generate options for birthDay dropdown
    const birthDayDropdown = document.getElementById("birthDay");
    for (let day = 1; day <= 31; day++) {
        const option = document.createElement("option");
        option.text = day;
        option.value = day;
        birthDayDropdown.add(option);
    }
});


const monthNameToNumber = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
};


const registerUser = async(e) => {
    e.preventDefault(); // preventing refresh of the page

    const firstname = document.querySelector("#firstname").value;
    const lastname = document.querySelector("#lastname").value;
    const password = document.querySelector("#password").value;
    const email = document.querySelector("#email").value;
    const bio = document.querySelector("#bio").value;
    const profile_picture_url = document.querySelector("#profile_picture_url").value;
    const country = document.querySelector("#countries").value;
    const birthDay = document.querySelector("#birthDay").value;
    const birthMonth = document.querySelector("#birthMonth").value;
    const birthYear = document.querySelector("#birthYear").value;
    let gender;
    const genderInputs = document.getElementsByName('gender');
    for (const input of genderInputs) {
        if (input.checked) {
            gender = input.value;
            break;
        }
    }
    const birth_date = new Date(birthYear, monthNameToNumber[birthMonth], birthDay).toISOString().slice(0, 10);
    const newUser = { firstname, lastname, password, email, bio, profile_picture_url, country, birth_date, gender };
    console.log(birth_date);
    console.log(newUser);

    fetch("http://localhost:3000/api/users/register", {
            body: JSON.stringify(newUser),
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Request failed");
            }
            return response.json();
        })
        .then(data => {
            window.location.href = 'login.html';
            // Handle the successful response data here
        })
        .catch(error => {
            alert("Email already exists in the system.");
        });
};