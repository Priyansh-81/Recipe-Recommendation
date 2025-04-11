document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("admin-login-form");
    const loginError = document.getElementById("login-error");

    if (!loginForm) {
        console.error("Login form not found.");
        return;
    }

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent default form submission

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        // Clear previous errors
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
            console.log("✅ Server Response:", data);

            if (response.ok && data.admin) {
                // Extract and store admin profile from nested object
                const adminProfile = {
                    adminID: data.admin.AdminID,
                    name: data.admin.Name,
                    email: data.admin.Email,
                };

                localStorage.setItem("adminProfile", JSON.stringify(adminProfile));

                alert("Login successful!");
                window.location.href = "admin-dashboard.html";
            } else {
                loginError.textContent = data.error || "Invalid credentials.";
                loginError.style.display = "block";
            }
        } catch (error) {
            console.error("Fetch error:", error);
            loginError.textContent = "Server error. Please try again later.";
            loginError.style.display = "block";
        }
    });
});