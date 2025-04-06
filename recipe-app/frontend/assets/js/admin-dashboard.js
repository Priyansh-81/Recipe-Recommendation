
console.log("Stored adminProfile:", localStorage.getItem("adminProfile"));
document.addEventListener("DOMContentLoaded", () => {
    // Ensure admin session exists
    const adminProfile = JSON.parse(localStorage.getItem("adminProfile"));

    if (!adminProfile) {
        console.error("Admin not logged in. Redirecting...");
        window.location.href = "../index.html";
        return;
    }

    console.log("Admin profile loaded:", adminProfile);

    // Display Admin Info
    document.getElementById("admin-name").textContent = adminProfile.name || "Admin";
    document.getElementById("admin-email").textContent = adminProfile.email || "N/A";

    // Logout Functionality
    document.getElementById("logout-btn").addEventListener("click", () => {
        localStorage.removeItem("adminProfile"); // Clear session
        window.location.href = "../index.html"; // Redirect to login
    });
});