// ingredient.js

document.addEventListener("DOMContentLoaded", () => {
    displayIngredients();
    setupIngredientForm();
});

// 🟢 1. Add a New Ingredient
function setupIngredientForm() {
    const ingredientForm = document.querySelector("#ingredient-form");
    if (ingredientForm) {
        ingredientForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = document.querySelector("#ingredient-name").value.trim();
            const nutritionalValue = document.querySelector("#ingredient-nutritional").value.trim();

            let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
            const newIngredient = { id: Date.now(), name, nutritionalValue };
            ingredients.push(newIngredient);

            localStorage.setItem("ingredients", JSON.stringify(ingredients));
            alert("Ingredient added successfully!");
            displayIngredients();
            ingredientForm.reset();
        });
    }
}

// 🟢 2. Display Ingredients
function displayIngredients() {
    const ingredientList = document.querySelector("#ingredient-list");
    if (ingredientList) {
        ingredientList.innerHTML = "";
        const ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];

        ingredients.forEach((ingredient) => {
            const ingredientItem = document.createElement("div");
            ingredientItem.classList.add("ingredient-item");
            ingredientItem.innerHTML = `
                <h3>${ingredient.name}</h3>
                <p><strong>Nutritional Value:</strong> ${ingredient.nutritionalValue} kcal</p>
                <button onclick="deleteIngredient(${ingredient.id})">Delete</button>
                <button onclick="addToUserIngredients(${ingredient.id})">Add to My Ingredients</button>
            `;
            ingredientList.appendChild(ingredientItem);
        });
    }
}

// 🟢 3. Delete an Ingredient
function deleteIngredient(id) {
    let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
    ingredients = ingredients.filter(ingredient => ingredient.id !== id);
    localStorage.setItem("ingredients", JSON.stringify(ingredients));
    alert("Ingredient deleted!");
    displayIngredients();
}

// 🟢 4. Add to User's Ingredients
function addToUserIngredients(id) {
    let userIngredients = JSON.parse(localStorage.getItem("userIngredients")) || [];
    if (!userIngredients.includes(id)) {
        userIngredients.push(id);
        localStorage.setItem("userIngredients", JSON.stringify(userIngredients));
        alert("Ingredient added to your list!");
    } else {
        alert("Already in your ingredients list!");
    }
}

// 🟢 5. Suggest Recipes Based on Available Ingredients
document.querySelector("#suggest-recipes")?.addEventListener("click", function () {
    let recipes = JSON.parse(localStorage.getItem("recipes")) || [];
    let userIngredients = JSON.parse(localStorage.getItem("userIngredients")) || [];

    let suggestedRecipes = recipes.filter(recipe => {
        // Dummy logic: If any ingredient from the user's list matches a recipe, suggest it
        return userIngredients.some(ing => recipe.instructions.includes(ing));
    });

    const suggestionList = document.querySelector("#suggested-recipes");
    if (suggestionList) {
        suggestionList.innerHTML = "";
        if (suggestedRecipes.length === 0) {
            suggestionList.innerHTML = "<p>No recipes match your available ingredients.</p>";
        } else {
            suggestedRecipes.forEach(recipe => {
                const item = document.createElement("div");
                item.innerHTML = `<h3>${recipe.name}</h3>`;
                suggestionList.appendChild(item);
            });
        }
    }
});