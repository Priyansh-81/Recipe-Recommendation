document.addEventListener("DOMContentLoaded", () => {
    loadFeaturedRecipes();

    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");

    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if (query.length < 2) {
            searchResults.style.display = "none";
            return;
        }


        try {
            const response = await fetch(`http://localhost:5001/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            if (!results || results.length === 0) {
                searchResults.innerHTML = "<ul><li>No results found</li></ul>";
            } else {
                searchResults.innerHTML = `
                    <ul>
                    ${results
                        .map(
                            item => `<li onclick="selectResult('${item.Name.replace(/'/g, "\\'")}')">${item.Name}</li>`
                        )
                        .join("")}
                    </ul>
                `;
            }

            searchResults.style.display = "block";
        } catch (error) {
            console.error("Search error:", error);
            searchResults.innerHTML = "<ul><li>Error loading results</li></ul>";
            searchResults.style.display = "block";
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = "none";
        }
    });
});

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

            // Limit to 5 recipes for display
            const limited = recipes.slice(0, 5);
            limited.forEach(recipe => {
                const card = document.createElement("div");
                card.classList.add("recipe-card");

                // Use ImageURL from the database or fallback to placeholder
                const imageUrl = recipe.ImageURL && isValidImageUrl(recipe.ImageURL)
                    ? recipe.ImageURL
                    : "https://raw.githubusercontent.com/Devenified/DBMS_PICTURE/master/dal-tadka-recipe.jpg";

                const imageHtml = `<img src="${imageUrl}" alt="${recipe.Name}" class="recipe-image" />`;

                card.innerHTML = `
                    ${imageHtml}
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


function searchRecipes() {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return;
    window.location.href = `recipe-listing.html?q=${encodeURIComponent(query)}`;
}

function selectResult(name) {
    document.getElementById("searchInput").value = name;
    document.getElementById("searchResults").style.display = "none";
}

// Helper function to check if the image URL is valid
function isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
}
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userID"); // Retrieve userID from localStorage
    const recipesContainer = document.getElementById("recipesByIngredients");

    if (!userId) {
        alert("User not logged in.");
        window.location.href = "login.html";
        return;
    }

    // Load recipes based on user's ingredients
    loadRecipesByIngredients(userId, recipesContainer);
});

function loadRecipesByIngredients(userId, container) {
    container.innerHTML = "<p>Loading recipes...</p>";

    fetch(`http://localhost:5001/api/recommendRecipes?userId=${userId}`)
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch recipes");
            return response.json();
        })
        .then(recipes => {
            if (!recipes || recipes.length === 0) {
                container.innerHTML = "<p>No recipes found for your ingredients.</p>";
                return;
            }
            displayRecipeCards(recipes, container);
        })
        .catch(error => {
            console.error("Error loading recipes:", error);
            container.innerHTML = "<p>Error loading recipes.</p>";
        });
}

function displayRecipeCards(recipes, container) {
    container.innerHTML = ""; // Clear previous content

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");

        // Use ImageURL or fallback to placeholder
        const imageUrl = recipe.ImageURL && isValidImageUrl(recipe.ImageURL)
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
}

function isValidImageUrl(url) {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
}
document.addEventListener("DOMContentLoaded", () => {
    const ingredientForm = document.getElementById("ingredientForm");
    const ingredientMessage = document.getElementById("ingredientMessage");
  
    // Handle form submission
    ingredientForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Prevent default form submission
  
      const userId = localStorage.getItem("userID"); // Retrieve userID from localStorage
      if (!userId) {
        alert("User not logged in.");
        window.location.href = "login.html";
        return;
      }
  
      // Retrieve values from the form
      const ingredientName = document.getElementById("ingredientName").value.trim();
      const ingredientQuantity = document.getElementById("ingredientQuantity").value.trim();
  
      if (!ingredientName || !ingredientQuantity) {
        ingredientMessage.textContent = "Please fill in all fields.";
        ingredientMessage.style.color = "red";
        return;
      }
  
      try {
        // Send data to the backend API
        const response = await fetch("http://localhost:5001/api/userIngredients", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            ingredientName: ingredientName,
            quantity: ingredientQuantity,
          }),
        });
  
        if (response.ok) {
          ingredientMessage.textContent = "Ingredient added successfully!";
          ingredientMessage.style.color = "green";
  
          // Clear the form
          ingredientForm.reset();
  
          // Optionally reload recipes based on updated ingredients
          loadRecipesByIngredients(userId, document.getElementById("recipesByIngredients"));
        } else {
          throw new Error("Failed to add ingredient.");
        }
      } catch (error) {
        console.error("Error adding ingredient:", error);
        ingredientMessage.textContent = "Error adding ingredient. Please try again.";
        ingredientMessage.style.color = "red";
      }
    });
  });
  