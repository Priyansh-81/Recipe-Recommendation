async function fetchUserProfile() {
    const userID = localStorage.getItem("userID");
  
    try {
      const response = await fetch(`http://localhost:5001/api/profile/${userID}`);
      const data = await response.json();
  
      if (response.ok) {
        // Populate display
        document.getElementById("userName").textContent = data.Name;
        document.getElementById("userEmail").textContent = data.Email;
        document.getElementById("userPreferences").textContent = data.Preferences || "Not set";
  
        // Populate form
        document.getElementById("profileName").value = data.Name;
        document.getElementById("profileEmail").value = data.Email;
        document.getElementById("profilePreferences").value = data.Preferences || "all";
      } else {
        alert(data.error || "Error fetching profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Could not load profile.");
    }
  }
  
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
      console.log("Sending update request...");
  
      const response = await fetch('http://localhost:5001/api/updateProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userID,
          name: updatedName,
          email: updatedEmail,
          preferences: updatedPreferences
        })
      });
  
      console.log("Response status: ", response.status);
  
      if (response.ok) {
        const data = await response.json();
        console.log("Response data: ", data);
  
        // Update UI to show success
        document.getElementById("profileMessage").innerText = "Profile updated successfully!";
        document.getElementById("profileMessage").style.color = "green";
      } else {
        const result = await response.json();
        console.log("Error response: ", result);
        document.getElementById("profileMessage").innerText = result.error || "Failed to update profile.";
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