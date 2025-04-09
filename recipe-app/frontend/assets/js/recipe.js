document.addEventListener("DOMContentLoaded", async () => {
    await fetchRecipes();
    setupFilters();
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

function displayRecipes(recipes) {
    const recipeContainer = document.querySelector("#recipeContainer");

    if (!recipeContainer) {
        console.error("Error: recipeContainer element not found!");
        return;
    }

    recipeContainer.innerHTML = "";

    recipes.forEach((recipe) => {
        const recipeItem = document.createElement("div");
        recipeItem.classList.add("recipe-item");
        recipeItem.innerHTML = `
            <h3>${recipe.Name}</h3>
            <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
            <p><strong>Diet:</strong> ${recipe.DietType}</p>
            <p><strong>Difficulty:</strong> ${recipe.Difficulty || "N/A"}</p>
            <p><strong>Cooking Time:</strong> ${recipe.CookingTime || "Unknown"} mins</p>
            <p><strong>Instructions:</strong> ${recipe.Instructions || "No instructions provided."}</p>
            <button class="view-button" onclick="expand('${recipe.RecipeID}')">View</button>
            <button class="view-button" onclick="addfav('${recipe.RecipeID}')">Add to Favorite</button>
        `;
        recipeContainer.appendChild(recipeItem);
    });
}

function expand(recipeID) {
    window.location.href = `recipe-detail.html?id=${recipeID}`;
}

function setupFilters() {
    document.querySelectorAll("select").forEach(filter => {
        filter.addEventListener("change", async () => {
            const recipes = await fetchRecipes(); // ✅ Get fresh data
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

// ✅ Search bar now works dynamically
document.querySelector("#searchBar")?.addEventListener("input", function () {
    const query = this.value.toLowerCase();
    document.querySelectorAll(".recipe-item").forEach(recipe => {
        const name = recipe.querySelector("h3").textContent.toLowerCase();
        recipe.style.display = name.includes(query) ? "block" : "none";
    });
});