document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");
    const registerError = document.getElementById("register-error");

    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        registerError.textContent = "";
        registerError.style.display = "none";

        if (password !== confirmPassword) {
            registerError.textContent = "Passwords do not match!";
            registerError.style.display = "block";
            return;
        }

        const userData = { name, email, password };

        try {
            const response = await fetch("http://localhost:5001/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Registration successful! You can now log in.");
                window.location.href = "login.html";
            } else {
                registerError.textContent = result.error || "Registration failed.";
                registerError.style.display = "block";
            }
        } catch (error) {
            console.error("Error:", error);
            registerError.textContent = "Something went wrong. Try again later.";
            registerError.style.display = "block";
        }
    });
});