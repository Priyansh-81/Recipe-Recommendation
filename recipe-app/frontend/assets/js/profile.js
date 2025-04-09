async function updateUserProfile() {
    const userID = localStorage.getItem("userID");
    if (!userID) {
        alert("User not logged in.");
        return;
    }

    const updatedName = document.getElementById("profileName").value;
    const updatedEmail = document.getElementById("profileEmail").value;
    const updatedPreferences = document.getElementById("profilePreferences").value;

    try {
        const response = await fetch('/api/updateProfile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID,
                name: updatedName,
                email: updatedEmail
            })
        });

        if (response.ok) {
            // Save preferences to localStorage (since it's not stored in DB)
            localStorage.setItem("userPreferences", updatedPreferences);

            document.getElementById("profileMessage").innerText = "Profile updated successfully!";
            document.getElementById("profileMessage").style.color = "green";
        } else {
            document.getElementById("profileMessage").innerText = "Failed to update profile.";
            document.getElementById("profileMessage").style.color = "red";
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        document.getElementById("profileMessage").innerText = "An error occurred.";
        document.getElementById("profileMessage").style.color = "red";
    }
}

async function deleteAccount() {
    const userID = localStorage.getItem("userID");
    if (!userID) {
        alert("User not logged in.");
        return;
    }

    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        try {
            const response = await fetch('/api/deleteAccount', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userID })
            });

            if (response.ok) {
                alert("Your account has been deleted.");
                localStorage.clear();
                window.location.href = "./../index.html"; // Redirect after deletion
            } else {
                alert("Error deleting your account.");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            alert("Server error. Try again later.");
        }
    }
}