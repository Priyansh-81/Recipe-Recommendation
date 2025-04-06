async function updateUserProfile() {
    const updatedName = document.getElementById("profileName").value;
    const updatedEmail = document.getElementById("profileEmail").value;
    const updatedPreferences = document.getElementById("profilePreferences").value;

    const response = await fetch('/api/updateProfile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: updatedName,
            email: updatedEmail,
            preferences: updatedPreferences
        })
    });

    if (response.ok) {
        document.getElementById("profileMessage").innerText = "Profile updated successfully!";
        document.getElementById("profileMessage").style.color = "green";
    } else {
        document.getElementById("profileMessage").innerText = "Failed to update profile.";
        document.getElementById("profileMessage").style.color = "red";
    }
}

async function deleteAccount() {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        const response = await fetch('/api/deleteAccount', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: 1 }) // Replace with actual user ID
        });

        if (response.ok) {
            alert("Your account has been deleted.");
            window.location.href = "logout.html"; // Redirect after deletion
        } else {
            alert("Error deleting your account.");
        }
    }
}