document.addEventListener("DOMContentLoaded", () => {
    loadRecommendations();
});

function loadRecommendations() {
    const userId = localStorage.getItem("userID"); // Store this on login
    const container = document.getElementById("recommendationsContainer");

    if (!userId) {
        container.innerHTML = "<p>Please login to see recommendations.</p>";
        return;
    }

    container.innerHTML = "<p>Loading recommendations...</p>";

    fetch(`http://localhost:5001/api/recommendations/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch recommendations");
            }
            return response.json();
        })
        .then(recommendations => {
            container.innerHTML = "";

            if (recommendations.length === 0) {
                container.innerHTML = "<p>No recommendations available yet.</p>";
                return;
            }

            recommendations.forEach(recipe => {
                const card = document.createElement("div");
                card.classList.add("recommendation-item");
                card.innerHTML = `
                    <h3>${recipe.Name}</h3>
                    <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
                    <p><strong>Diet Type:</strong> ${recipe.DietType}</p>
                    <p><strong>Difficulty:</strong> ${recipe.Difficulty}</p>
                    <p><strong>Score:</strong> ${parseFloat(recipe.RecommendationScore).toFixed(1)}/10</p>
                    <button onclick="addToFavorites(${recipe.RecipeID}, '${recipe.Name}')">Add to Favorites</button>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error fetching recommendations:", error);
            container.innerHTML = "<p>Could not load recommendations. Try again later.</p>";
        });
}

function addToFavorites(recipeId, recipeName) {
    const userId = localStorage.getItem("userID");

    if (!userId) {
        alert("Please login to add favorites.");
        return;
    }

    fetch("http://localhost:5001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, recipeId })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message || "Added to favorites!");
    })
    .catch(err => {
        console.error("Failed to add favorite:", err);
        alert("Error adding to favorites.");
    });
}

    // Option 2 (Recommended): Save to backend using API
    /*
    const userId = localStorage.getItem("userID");
    fetch("http://localhost:5001/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, recipeId })
    })
    .then(res => res.json())
    .then(data => alert(data.message))
    .catch(err => {
        console.error("Failed to add favorite:", err);
        alert("Failed to add favorite.");
    });
    */
