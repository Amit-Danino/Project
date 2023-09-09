    // Function to toggle password visibility
    function togglePasswordVisibility() {
        const passwordInput = document.getElementById("password");
        const passwordToggle = document.getElementById("passwordToggle");

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            passwordToggle.innerHTML = "&#128064;"; // Show the eye slash icon
        } else {
            passwordInput.type = "password";
            passwordToggle.innerHTML = "&#128065;"; // Show the eye icon
        }
    }