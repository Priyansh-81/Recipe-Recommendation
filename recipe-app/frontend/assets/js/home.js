document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userID");
    if (!userId) {
        alert("User not logged in.");
        window.location.href = "login.html";
        return;
    }

    loadFeaturedRecipes();
    setupIngredientForm();

    const recipesContainer = document.getElementById("recipesByIngredients");
    if (recipesContainer) {
        loadRecipesByIngredients(userId, recipesContainer);
        loadUserIngredients(userId); // Load user's ingredients
    }
});

// ========== FEATURED RECIPES ==========
function loadFeaturedRecipes() {
    const userDietType = localStorage.getItem("userPreferences") || "all";
    const url = userDietType === "all"
        ? "http://localhost:5001/api/recipes"
        : `http://localhost:5001/api/recipes/diet/${userDietType}`;

    fetch(url)
        .then(response => response.json())
        .then(recipes => {
            const container = document.getElementById("featured-recipes");
            container.innerHTML = "";

            if (!recipes || recipes.length === 0) {
                container.innerHTML = "<p>No recipes found for your preferences.</p>";
                return;
            }

            recipes.slice(0, 5).forEach(recipe => {
                const card = document.createElement("div");
                card.classList.add("recipe-card");

                const imageUrl = isValidImageUrl(recipe.ImageURL)
                    ? recipe.ImageURL
                    : "https://raw.githubusercontent.com/Devenified/DBMS_PICTURE/master/dal-tadka-recipe.jpg";

                card.innerHTML = `
                    <img src="${imageUrl}" alt="${recipe.Name}" class="recipe-image" />
                    <h3>${recipe.Name}</h3>
                    <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
                    <p><strong>Diet:</strong> ${recipe.DietType}</p>
                    <p><strong>Difficulty:</strong> ${recipe.Difficulty}</p>
                    <a href="recipe-detail.html?id=${recipe.RecipeID}" class="view-button">View</a>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading recipes:", error);
            document.getElementById("featured-recipes").innerHTML = "<p>Error loading recipes.</p>";
        });
}

// ========== INGREDIENTS ==========
function setupIngredientForm() {
    const ingredientForm = document.getElementById("ingredientForm");
    const ingredientMessage = document.getElementById("ingredientMessage");

    if (!ingredientForm || !ingredientMessage) return;

    ingredientForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = localStorage.getItem("userID");
        if (!userId) {
            alert("User not logged in.");
            window.location.href = "login.html";
            return;
        }

        const name = document.getElementById("ingredientName").value.trim();
        const quantity = document.getElementById("ingredientQuantity").value.trim();

        if (!name || !quantity) {
            ingredientMessage.textContent = "Please fill in all fields.";
            ingredientMessage.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/userIngredients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ingredientName: name, quantity })
            });

            if (response.ok) {
                ingredientMessage.textContent = "Ingredient added successfully!";
                ingredientMessage.style.color = "green";
                ingredientForm.reset();

                loadUserIngredients(userId); // Reload user's ingredients
            } else {
                throw new Error("Failed to add ingredient.");
            }
        } catch (error) {
            console.error("Error adding ingredient:", error);
            ingredientMessage.textContent = "Error adding ingredient. Please try again.";
            ingredientMessage.style.color = "red";
        }
    });
}

function loadUserIngredients(userId) {
    const container = document.getElementById("ingredientList");

    fetch(`http://localhost:5001/api/userIngredients/${userId}`)
      .then(response => response.json())
      .then(ingredients => {
          container.innerHTML = "";

          if (!ingredients || ingredients.length === 0) {
              container.innerHTML = "<p>No ingredients found.</p>";
              return;
          }

          ingredients.forEach(ingredient => {
              const item = document.createElement("div");
              item.classList.add("ingredient-item");

              item.innerHTML = `
                  <p><strong>${ingredient.IngredientName}</strong>: ${ingredient.Quantity}</p>
                  <button onclick="deleteIngredient(${ingredient.UserIngredientID})">Delete</button>
              `;

              container.appendChild(item);
          });
      })
      .catch(error => {
          console.error("Error loading ingredients:", error);
          container.innerHTML = "<p>Error loading ingredients.</p>";
      });
}

function deleteIngredient(id) {
    fetch(`http://localhost:5001/api/userIngredients/${id}`, { method: "DELETE" })
      .then(response => response.json())
      .then(data => {
          alert(data.message || "Ingredient deleted successfully.");
          
          // Reload the user's ingredients
          const userId = localStorage.getItem("userID");
          loadUserIngredients(userId);
      })
      .catch(error => {
          console.error("Error deleting ingredient:", error);
          alert("Failed to delete ingredient.");
      });
}

// ========== RECIPES BY INGREDIENTS ==========
function loadRecipesByIngredients(userId, container) {
    container.innerHTML = "<p>Loading recipes...</p>";

    fetch(`http://localhost:5001/api/recommendRecipes?userId=${userId}`)
        .then(response => response.json())
        .then(recipes => {
            container.innerHTML = "";

            if (!recipes || recipes.length === 0) {
                container.innerHTML = "<p>No recipes found for your ingredients.</p>";
                return;
            }

            recipes.forEach(recipe => {
                const card = document.createElement("div");
                card.classList.add("recipe-card");

                const imageUrl = isValidImageUrl(recipe.ImageURL)
                    ? recipe.ImageURL
                    : "https://raw.githubusercontent.com/Devenified/DBMS_PICTURE/master/IMG-20250410-WA0002.jpg";

                card.innerHTML = `
                    <img src="${imageUrl}" alt="${recipe.Name}" class="recipe-image" />
                    <h3>${recipe.Name}</h3>
                    <p><strong>Cuisine:</strong> ${recipe.Cuisine}</p>
                    <p><strong>Diet:</strong> ${recipe.DietType}</p>
                    <p><strong>Difficulty:</strong> ${recipe.Difficulty}</p>
                    <a href="recipe-detail.html?id=${recipe.RecipeID}" class="view-button">View Recipe</a>
                `;

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading recipes:", error);
            container.innerHTML = "<p>Error loading recipes.</p>";
        });
}

// ========== HELPER ==========
function isValidImageUrl(url) {
    try {
        new URL(url); // Check if URL is valid
        return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url.split('?')[0]); // Validate extension
    } catch {
        return false;
    }
}
