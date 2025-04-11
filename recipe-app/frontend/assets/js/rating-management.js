document.addEventListener("DOMContentLoaded", async function () {
    const ratingsList = document.getElementById("ratings-list");
    let ratings = [];

    // Fetch ratings from the backend
    async function fetchRatings() {
        try {
            const response = await fetch("http://localhost:5001/api/ratings");
            if (!response.ok) throw new Error("Failed to fetch ratings");
            ratings = await response.json();
            renderRatings();
        } catch (error) {
            console.error("Error loading ratings:", error);
            ratingsList.innerHTML += `<tr><td colspan="6">Failed to load ratings.</td></tr>`;
        }
    }

    function renderRatings() {
        ratingsList.innerHTML = `
            <tr>
                <th>Rating ID</th>
                <th>Recipe ID</th>
                <th>User ID</th>
                <th>Rating</th>
                <th>Review Text</th>
                <th>Actions</th>
            </tr>`;

        ratings.forEach((rating, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rating.RatingID}</td>
                <td>${rating.RecipeID}</td>
                <td>${rating.UserID}</td>
                <td>${rating.Rating}</td>
                <td>${rating.ReviewText || "-"}</td>
                <td>
                    <button onclick="deleteRating(${index})">Delete</button>
                </td>
            `;
            ratingsList.appendChild(row);
        });
    }

    // Placeholder edit function
    window.editRating = function (index) {
        const rating = ratings[index];
        alert(`Edit Rating ${rating.RatingID}: Coming soon...`);
    };

    // Delete rating from backend
    window.deleteRating = async function (index) {
        const rating = ratings[index];
        const confirmDelete = confirm(`Are you sure you want to delete rating ID ${rating.RatingID}?`);
        if (!confirmDelete) return;

        try {
            const res = await fetch(`http://localhost:5001/api/ratings/${rating.RatingID}`, {
                method: "DELETE",
            });

            if (res.ok) {
                alert("Rating deleted successfully!");
                ratings.splice(index, 1);
                renderRatings();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (err) {
            console.error("Error deleting rating:", err);
            alert("Error deleting rating.");
        }
    };

    // Start
    fetchRatings();
});