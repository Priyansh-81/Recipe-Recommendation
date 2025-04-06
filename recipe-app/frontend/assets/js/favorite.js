document.addEventListener("DOMContentLoaded", () => {
    displayFavorites();
});


async function addToFavorites(recipeId) {
    const userId = 1; // Example User ID, replace with actual logged-in user ID

    try {
        // Send a request to the backend to add the favorite
        const response = await fetch('/api/addFavorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, recipeId })
        });

        if (response.ok) {
            alert("Recipe added to favorites!");
        } else {
            alert("Failed to add recipe to favorites.");
        }
    } catch (error) {
        console.error("Error adding to favorites:", error);
    }
}


async function displayFavorites() {
    const favoriteList = document.querySelector("#favorite-list");
    if (favoriteList) {
        favoriteList.innerHTML = "";
        const userId = 1; // Example User ID, replace with actual logged-in user ID

        try {
            const response = await fetch(`/api/getFavorites?userId=${userId}`);
            const favorites = await response.json();

            if (favorites.length === 0) {
                favoriteList.innerHTML = "<p>No favorite recipes yet.</p>";
                return;
            }

            for (const favorite of favorites) {
                const recipeResponse = await fetch(`/api/getRecipeById?id=${favorite.recipeId}`);
                const recipe = await recipeResponse.json();

                const favItem = document.createElement("div");
                favItem.classList.add("favorite-item");
                favItem.innerHTML = `
                    <h3>${recipe.name}</h3>
                    <button onclick="removeFromFavorites('${favorite.favoriteId}')">Remove</button>
                `;
                favoriteList.appendChild(favItem);
            }
        } catch (error) {
            console.error("Error displaying favorites:", error);
        }
    }
}

async function removeFromFavorites(favoriteId) {
    try {
        await fetch(`/api/removeFavorite?favoriteId=${favoriteId}`, { method: 'DELETE' });
        alert("Recipe removed from favorites!");
        displayFavorites(); // Refresh the favorites list
    } catch (error) {
        console.error("Error removing favorite:", error);
    }
}