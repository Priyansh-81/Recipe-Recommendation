// Check if user is logged in
function isUserLoggedIn() {
    return !!localStorage.getItem("userID");
}

// Redirect to login page if not logged in
function enforceAuth() {
    if (!isUserLoggedIn()) {
        window.location.href = "../index.html";
    }
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}