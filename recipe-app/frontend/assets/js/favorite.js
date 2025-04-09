document.addEventListener("DOMContentLoaded", () => {
    displayFavorites();
});

// 🟢 Add a recipe to favorites
async function addToFavorites(recipeId) {
    const userId = localStorage.getItem("userID");

    if (!userId) {
        alert("Please login to add favorites.");
        return;
    }

    try {
        const response = await fetch('http://localhost:5001/api/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, recipeId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Recipe added to favorites!");
        } else {
            alert(data.error || "Failed to add recipe to favorites.");
        }
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}

// 🟢 Display all favorite recipes
async function displayFavorites() {
    const favoriteList = document.querySelector("#favorite-list");
    const userId = localStorage.getItem("userID");

    if (!userId) {
        favoriteList.innerHTML = "<p>Please login to view favorites.</p>";
        return;
    }

    favoriteList.innerHTML = "<p>Loading favorites...</p>";

    try {
        const response = await fetch(`http://localhost:5001/api/favorite/${userId}`);
        const favorites = await response.json();

        favoriteList.innerHTML = "";

        if (favorites.length === 0) {
            favoriteList.innerHTML = "<p>No favorite recipes yet.</p>";
            return;
        }

        favorites.forEach(recipe => {
            const favItem = document.createElement("div");
            favItem.classList.add("favorite-item");
            favItem.innerHTML = `
                <h3>${recipe.Name}</h3>
                <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
                <p><strong>Diet Type:</strong> ${recipe.DietType}</p>
                <p><strong>Difficulty:</strong> ${recipe.Difficulty}</p>
                <button onclick="removeFromFavorites(${userId}, ${recipe.RecipeID})">Remove</button>
            `;
            favoriteList.appendChild(favItem);
        });
    } catch (error) {
        console.error("Error displaying favorites:", error);
        favoriteList.innerHTML = "<p>Failed to load favorites.</p>";
    }
}

// 🔴 Remove a favorite
async function removeFromFavorites(userId, recipeId) {
    try {
        const response = await fetch(`http://localhost:5001/api/favorite/${userId}/${recipeId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Recipe removed from favorites!");
            displayFavorites(); // Refresh
        } else {
            alert(data.error || "Failed to remove favorite.");
        }
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
}