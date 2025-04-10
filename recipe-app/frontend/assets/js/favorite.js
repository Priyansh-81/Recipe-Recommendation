document.addEventListener("DOMContentLoaded", () => {
    displayFavorites();
  });
  
  async function displayFavorites() {
    const favoriteList = document.querySelector("#favorite-list");
    const userId = localStorage.getItem("userID");
  
    if (!userId) {
      favoriteList.innerHTML = "<p>Please login to view favorites.</p>";
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5001/api/favorites/${userId}`);
      const favorites = await response.json();
  
      if (!Array.isArray(favorites)) {
        throw new Error("Invalid response");
      }
  
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
          <div class="favorite-buttons">
            <button onclick="window.location.href='recipe-detail.html?id=${recipe.RecipeID}'">View</button>
            <button onclick="removeFromFavorites('${userId}', '${recipe.RecipeID}')">Remove</button>
          </div>
        `;
        favoriteList.appendChild(favItem);
      });
    } catch (err) {
      console.error("Error loading favorites:", err);
      favoriteList.innerHTML = "<p>Failed to load favorites.</p>";
    }
  }
  
  async function removeFromFavorites(userId, recipeId) {
    try {
      const res = await fetch(`http://localhost:5001/api/favorite/${userId}/${recipeId}`, {
        method: "DELETE"
      });
  
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Removed!");
        displayFavorites();
      } else {
        alert(data.error || "Failed to remove favorite.");
      }
    } catch (err) {
      console.error("Remove error:", err);
    }
  }