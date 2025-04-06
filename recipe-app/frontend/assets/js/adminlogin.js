document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("admin-login-form");
    const loginError = document.getElementById("login-error");

    if (!loginForm) {
        console.error("Login form not found. Check the form ID in HTML.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent form submission

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Reset error message
        loginError.textContent = "";
        loginError.style.display = "none";

        if (!email || !password) {
            loginError.textContent = "Please fill in all fields.";
            loginError.style.display = "block";
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Ensure admin data is stored consistently as an object
                const adminProfile = {
                    adminID: data.adminID,
                    name: data.name,
                    email: data.email,
                };

                localStorage.setItem("adminProfile", JSON.stringify(adminProfile));

                alert("Login successful!");
                window.location.href = "admin-dashboard.html"; // Redirect to dashboard
            } else {
                loginError.textContent = data.error || "Invalid credentials.";
                loginError.style.display = "block";
            }
        } catch (error) {
            console.error("Error:", error);
            loginError.textContent = "Server error. Please try again later.";
            loginError.style.display = "block";
        }
    });
});