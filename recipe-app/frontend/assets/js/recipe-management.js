document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();

    const addRecipeForm = document.getElementById("addRecipeForm");
    addRecipeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await addRecipe();
    });

    // Add event listener for search input
    document.getElementById("searchBox").addEventListener("keyup", searchRecipes);
});

// Fetch and display all recipes
async function fetchRecipes() {
    try {
        const response = await fetch("http://localhost:5001/api/recipes"); 
        if (!response.ok) throw new Error("Failed to fetch recipes");

        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error("Error fetching recipes:", error);
    }
}

// Display recipes in the table
function displayRecipes(recipes) {
    const recipeTableBody = document.getElementById("recipeTableBody");
    recipeTableBody.innerHTML = "";

    recipes.forEach((recipe) => {
        const row = document.createElement("tr");
        row.classList.add("recipe-row");
        row.innerHTML = `
            <td>${recipe.RecipeID}</td>
            <td>${recipe.Name}</td>
            <td>${recipe.Cuisine}</td>
            <td>${recipe.DietType}</td>
            <td>${recipe.CookingTime} mins</td>
            <td>
                <button onclick="editRecipe(${recipe.RecipeID})">Edit</button>
                <button onclick="deleteRecipe(${recipe.RecipeID})">Delete</button>
            </td>
        `;
        recipeTableBody.appendChild(row);
    });
}

// Search function for filtering recipes
function searchRecipes() {
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();
    const rows = document.querySelectorAll(".recipe-row");

    rows.forEach((row) => {
        const recipeName = row.cells[1].textContent.toLowerCase();
        const cuisine = row.cells[2].textContent.toLowerCase();
        const dietType = row.cells[3].textContent.toLowerCase();

        if (recipeName.includes(searchTerm) || cuisine.includes(searchTerm) || dietType.includes(searchTerm)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// Add a new recipe
async function addRecipe() {
    const adminID = localStorage.getItem("adminID");

    if (!adminID) {
        alert("Unauthorized: Admin not logged in.");
        window.location.href = "adminlogin.html";
        return;
    }

    const name = document.getElementById("name").value.trim();
    const cuisine = document.getElementById("cuisine").value.trim();
    const dietType = document.getElementById("diet").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const cookingTime = parseInt(document.getElementById("cookingTime").value, 10);
    const instructions = document.getElementById("instructions").value.trim();

    if (!name || !cuisine || !dietType || !difficulty || !cookingTime || !instructions) {
        alert("Please fill all fields.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5001/api/recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                adminID,
                name,
                cuisine,
                dietType,
                difficulty,
                cookingTime,
                instructions
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add recipe");
        }

        alert("Recipe added successfully!");
        document.getElementById("addRecipeForm").reset();
        fetchRecipes(); 
    } catch (error) {
        console.error("Error adding recipe:", error);
        alert("Error adding recipe: " + error.message);
    }
}

// Delete a recipe
async function deleteRecipe(recipeID) {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
        const response = await fetch(`http://localhost:5001/api/recipes/${recipeID}`, {
            method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete recipe");

        alert("Recipe deleted successfully!");
        fetchRecipes();
    } catch (error) {
        console.error("Error deleting recipe:", error);
    }
}