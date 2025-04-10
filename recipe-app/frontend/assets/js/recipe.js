document.addEventListener("DOMContentLoaded", async () => {
    const recipes = await fetchRecipes();
    setupFilters(recipes);
    setupSearch();
});

async function fetchRecipes() {
    try {
        const response = await fetch("http://localhost:5001/api/recipes");
        if (!response.ok) throw new Error("Failed to fetch recipes");

        const recipes = await response.json();
        displayRecipes(recipes);
        return recipes;
    } catch (error) {
        console.error("Error fetching recipes:", error);
        return [];
    }
}

async function displayRecipes(recipes) {
    const recipeContainer = document.querySelector("#recipeContainer");

    if (!recipeContainer) {
        console.error("Error: recipeContainer element not found!");
        return;
    }

    recipeContainer.innerHTML = "";

    for (const recipe of recipes) {
        const avgRating = await fetchAverageRating(recipe.RecipeID);
        const starsHTML = generateStarHTML(avgRating);

        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe-item");
        recipeItem.innerHTML = `
            <h3>${recipe.Name}</h3>
            <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
            <p><strong>Diet:</strong> ${recipe.DietType}</p>
            <p><strong>Difficulty:</strong> ${recipe.Difficulty || "N/A"}</p>
            <p><strong>Cooking Time:</strong> ${recipe.CookingTime || "Unknown"} mins</p>
            <p><strong>Rating:</strong> ${starsHTML}</p>
            <button class="view-button" onclick="expand('${recipe.RecipeID}')">View</button>
            <button class="view-button" onclick="addfav('${recipe.RecipeID}')">Add to Favorite</button>
        `;
        recipeContainer.appendChild(recipeItem);
    }
}

function expand(recipeID) {
    window.location.href = `recipe-detail.html?id=${recipeID}`;
}

function setupFilters(recipes) {
    document.querySelectorAll("select").forEach(filter => {
        filter.addEventListener("change", () => {
            applyFilters(recipes);
        });
    });
}

function applyFilters(recipes) {
    const cuisineFilter = document.querySelector("#cuisine").value.toLowerCase();
    const dietFilter = document.querySelector("#diet").value.toLowerCase();
    const difficultyFilter = document.querySelector("#difficulty").value.toLowerCase();

    let filteredRecipes = recipes;

    if (cuisineFilter !== "all") {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.Cuisine.toLowerCase() === cuisineFilter);
    }

    if (dietFilter !== "all") {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.DietType.toLowerCase() === dietFilter);
    }

    if (difficultyFilter !== "all") {
        filteredRecipes = filteredRecipes.filter(recipe => recipe.Difficulty.toLowerCase() === difficultyFilter);
    }

    displayRecipes(filteredRecipes);
}

function setupSearch() {
    document.querySelector("#searchBar")?.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        document.querySelectorAll(".recipe-item").forEach(recipe => {
            const name = recipe.querySelector("h3").textContent.toLowerCase();
            recipe.style.display = name.includes(query) ? "block" : "none";
        });
    });
}

// ⭐ Fetch average rating from backend
async function fetchAverageRating(recipeID) {
    try {
        const res = await fetch(`http://localhost:5001/api/ratings/average/${recipeID}`);
        const data = await res.json();
        return data.average || 0;
    } catch (error) {
        console.error("Error fetching average rating:", error);
        return 0;
    }
}

// ⭐ Generate stars based on rating
function generateStarHTML(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);

    return `
        <span class="rating-stars">
            ${'⭐'.repeat(full)}${half ? '🌓' : ''}${'☆'.repeat(empty)}
        </span>
        <span style="font-size: 13px; color: #999;">(${rating.toFixed(1)})</span>
    `;
}

// ✅ Add to Favorite Function
async function addfav(recipeId) {
    const userId = localStorage.getItem("userID");

    if (!userId) {
        alert("Please log in to add to favorites.");
        return;
    }

    const favoriteID = `FAV-${userId}-${recipeId}`; // Unique FavoriteID format

    try {
        const response = await fetch("http://localhost:5001/api/favorite", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ favoriteID, userId, recipeId })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message || "Added to favorites!");
        } else {
            alert(data.error || "Already in favorites.");
        }
    } catch (error) {
        console.error("Error adding to favorites:", error);
        alert("Something went wrong while adding to favorites.");
    }
}