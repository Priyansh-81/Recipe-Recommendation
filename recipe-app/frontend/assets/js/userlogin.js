document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("user-login-form");
    const loginError = document.createElement("p");
    loginForm.appendChild(loginError);

    if (!loginForm) {
        console.error("Login form not found.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); 

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        loginError.textContent = "";

        if (!email || !password) {
            loginError.textContent = "Please fill in all fields.";
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.admin) {
                const user = data.admin;

                // ✅ Store user info in localStorage for session
                localStorage.setItem("userID", user.UserID);
                localStorage.setItem("userName", user.Name);
                localStorage.setItem("userEmail", user.Email);
                localStorage.setItem("userRole", "user");

                alert("Login successful!");
                window.location.href = "home.html";
            } else {
                loginError.textContent = data.error || "Invalid credentials.";
            }
        } catch (error) {
            console.error("Error:", error);
            loginError.textContent = "Server error. Please try again later.";
        }
    });
});