// home.js

document.addEventListener("DOMContentLoaded", () => {
    loadFeaturedRecipes();
    setupSearch();
    setupCarousel();
    checkUserLogin();
});

// 🟢 1. Fetch and Display Featured Recipes
function loadFeaturedRecipes() {
    fetch("data/recipes.json") // Assuming JSON file or API
        .then(response => response.json())
        .then(data => {
            const recipeContainer = document.querySelector("#featured-recipes");
            if (recipeContainer) {
                recipeContainer.innerHTML = data.map(recipe => `
                    <div class="recipe-card">
                        <img src="${recipe.image}" alt="${recipe.name}">
                        <h3>${recipe.name}</h3>
                        <p>${recipe.cuisine} | ${recipe.dietType}</p>
                        <a href="recipe-detail.html?id=${recipe.id}" class="btn">View Recipe</a>
                    </div>
                `).join("");
            }
        })
        .catch(error => console.error("Error loading recipes:", error));
}

// 🟢 2. Search Functionality
function setupSearch() {
    const searchInput = document.querySelector("#search-input");
    const searchButton = document.querySelector("#search-button");

    if (searchInput && searchButton) {
        searchButton.addEventListener("click", () => {
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });

        searchInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                searchButton.click();
            }
        });
    }
}

// 🟢 3. Carousel for Trending Recipes
function setupCarousel() {
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;

    let index = 0;
    const items = carousel.querySelectorAll(".carousel-item");

    function showNextItem() {
        items[index].classList.remove("active");
        index = (index + 1) % items.length;
        items[index].classList.add("active");
    }

    setInterval(showNextItem, 3000);
}

// 🟢 4. User Greeting (if logged in)
function checkUserLogin() {
    const user = JSON.parse(localStorage.getItem("user"));
    const greetingContainer = document.querySelector("#user-greeting");

    if (user && greetingContainer) {
        greetingContainer.textContent = `Welcome, ${user.name}!`;
    }
}