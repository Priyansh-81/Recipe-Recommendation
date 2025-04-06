fetch("/api/logout", { method: "POST", credentials: "include" })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem("userToken");
            window.location.href = "login.html";
        }
    })
    .catch(error => console.error("Logout failed:", error));