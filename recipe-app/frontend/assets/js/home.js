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
    fetch("http://localhost:5001/api/recipes")
      .then(response => response.json())
      .then(recipes => {
        const container = document.getElementById("featured-recipes");
        container.innerHTML = "";
  
        if (!recipes || recipes.length === 0) {
          container.innerHTML = "<p>No recipes found.</p>";
          return;
        }
  
        const limited = recipes.slice(0, 5);
  
        limited.forEach(recipe => {
          const card = document.createElement("div");
          card.classList.add("recipe-card");
  
          const imageHtml = recipe.ImageURL
            ? `<img src="${recipe.ImageURL}" alt="${recipe.Name}" />`
            : `<div class="image-placeholder">No Image</div>`;
  
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