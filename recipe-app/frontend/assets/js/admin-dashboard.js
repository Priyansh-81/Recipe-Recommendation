document.addEventListener("DOMContentLoaded", function () {
    // Retrieve admin profile from localStorage
    const adminProfile = JSON.parse(localStorage.getItem("adminProfile"));

    // Validate and display admin details
    if (adminProfile && adminProfile.name && adminProfile.email) {
        const nameElement = document.getElementById("admin-name");
        const emailElement = document.getElementById("admin-email");

        if (nameElement) nameElement.textContent = adminProfile.name;
        if (emailElement) emailElement.textContent = adminProfile.email;
    } else {
        alert("No admin profile found. Please log in again.");
        window.location.href = "../index.html"; // Redirect to login
    }

});
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5001/api/total-users');
        const data = await response.json();

        // Display total number of users
        document.getElementById('total-users').textContent = data.totalUsers;
    } catch (error) {
        console.error('Error fetching total users:', error);
        document.getElementById('total-users').textContent = 'Error';
    }
});
