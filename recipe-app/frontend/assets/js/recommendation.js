// recommendations.js

document.addEventListener("DOMContentLoaded", () => {
    generateRecommendations();
});

// 🟢 1. Generate Personalized Recommendations
function generateRecommendations() {
    const recommendationsContainer = document.querySelector("#recommendations");
    if (!recommendationsContainer) return;

    recommendationsContainer.innerHTML = "<p>Loading recommendations...</p>";

    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    let userPreferences = JSON.parse(localStorage.getItem("userPreferences")) || [];
    let userIngredients = JSON.parse(localStorage.getItem("userIngredients")) || [];

    // Filter recipes based on user preferences and available ingredients
    let recommendedRecipes = recipes.filter(recipe => {
        return (
            userPreferences.includes(recipe.cuisine) || 
            userPreferences.includes(recipe.dietType) || 
            recipe.ingredients.every(ing => userIngredients.includes(ing))
        );
    });

    // Sort recommendations by relevance
    recommendedRecipes.sort((a, b) => b.relevance - a.relevance);

    // 🟢 2. Display Recommended Recipes
    displayRecommendations(recommendedRecipes);
}

// 🟢 3. Display Recommendations in the UI
function displayRecommendations(recommendedRecipes) {
    const recommendationsContainer = document.querySelector("#recommendations");
    recommendationsContainer.innerHTML = "";

    if (recommendedRecipes.length === 0) {
        recommendationsContainer.innerHTML = "<p>No recommendations found. Try adding preferences or ingredients!</p>";
        return;
    }

    recommendedRecipes.forEach(recipe => {
        const recipeCard = document.createElement("div");
        recipeCard.classList.add("recipe-card");
        recipeCard.innerHTML = `
            <h3>${recipe.name}</h3>
            <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
            <p><strong>Diet Type:</strong> ${recipe.dietType}</p>
            <button onclick="addToFavorites(${recipe.id})">Add to Favorites</button>
        `;
        recommendationsContainer.appendChild(recipeCard);
    });
}