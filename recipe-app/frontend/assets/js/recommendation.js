document.addEventListener("DOMContentLoaded", () => {
    loadRecommendations();
});

async function loadRecommendations() {
    const userId = localStorage.getItem("userID");
    const container = document.getElementById("recommendationsContainer");

    if (!userId) {
        container.innerHTML = "<p>Please login to see recommendations.</p>";
        return;
    }

    container.innerHTML = "<p>Loading recommendations...</p>";

    try {
        const response = await fetch(`http://localhost:5001/api/recommendations/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch recommendations");

        const recommendations = await response.json();
        container.innerHTML = "";

        if (recommendations.length === 0) {
            container.innerHTML = "<p>No recommendations available yet.</p>";
            return;
        }

        recommendations.forEach(recipe => {
            const card = document.createElement("div");
            card.classList.add("favorite-item");

            // Use ImageURL or fallback to placeholder
            const imageUrl = recipe.ImageURL && isValidImageUrl(recipe.ImageURL)
                ? recipe.ImageURL
                : "https://raw.githubusercontent.com/Devenified/DBMS_PICTURE/master/IMG-20250410-WA0002.jpg";

            card.innerHTML = `
                <div class="imagesforrec">
                <img src="${imageUrl}" alt="${recipe.Name}" class="recipe-image" />
                </div>
                <h3>${recipe.Name}</h3>
                <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
                <p><strong>Diet Type:</strong> ${recipe.DietType}</p>
                <p><strong>Difficulty:</strong> ${recipe.Difficulty}</p>
                <p><strong>Score:</strong> ${recipe.RecommendationScore}/10</p>
                <button onclick="viewRecipe(${recipe.RecipeID})">View Recipe</button>
                <button onclick="addToFavorites(${recipe.RecipeID})">Add to Favorites</button>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        container.innerHTML = "<p>Could not load recommendations.</p>";
    }
}


function viewRecipe(recipeId) {
    window.location.href = `recipe-detail.html?id=${recipeId}`;
}

async function addToFavorites(recipeId) {
    const userId = localStorage.getItem("userID");

    if (!userId) {
        alert("Please log in to add recipes to your favorites.");
        return;
    }

    const favoriteID = `FAV-${userId}-${recipeId}`;

    try {
        const res = await fetch("http://localhost:5001/api/favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ favoriteID, userId, recipeId }),
        });

        const data = await res.json();

        if (res.ok) {
            alert(data.message || "Added to favorites!");
        } else {
            alert(data.error || "Failed to add to favorites. Try again later.");
        }
    } catch (err) {
        console.error("Failed to add to favorites:", err);
        alert("Error adding to favorites.");
    }
}

function isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
}
