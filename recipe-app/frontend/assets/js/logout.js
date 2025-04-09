fetch("/api/logout", { method: "POST", credentials: "include" })
    .then(response => {
        if (response.ok) {
            // ✅ Clear all user-related data from localStorage
            localStorage.removeItem("userID");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");
            localStorage.removeItem("userToken"); // in case token was stored

            // Optional: clear all localStorage (if your app only uses it for auth)
            // localStorage.clear();

            window.location.href = "login.html";
        } else {
            console.error("Logout failed: Server responded with", response.status);
        }
    })
    .catch(error => console.error("Logout failed:", error));