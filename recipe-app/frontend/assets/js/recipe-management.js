document.addEventListener("DOMContentLoaded", () => {
    fetchRecipes();

    const addRecipeForm = document.getElementById("addRecipeForm");
    addRecipeForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await addRecipe();
    });

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
                <button onclick="manageIncludes(${recipe.RecipeID})">Add Ingredients</button> 
            </td>
        `;
        recipeTableBody.appendChild(row);
    });
}
function manageIncludes(recipeID) {
    // Redirect to includes-management.html with the RecipeID as a query parameter
    window.location.href = `includes.html?recipeID=${recipeID}`;
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

async function addRecipe() {
    const adminProfile = JSON.parse(localStorage.getItem("adminProfile"));
    const adminID = adminProfile?.adminID;
    if (!adminID) {
        alert("Please log in first.");
        location.href = "adminlogin.html";
        return;
    }

    const name = document.getElementById("name").value.trim();
    const cuisine = document.getElementById("cuisine").value.trim();
    const dietType = document.getElementById("diet").value.trim();
    const difficulty = document.getElementById("difficulty").value.trim();
    const cookingTime = parseInt(document.getElementById("cookingTime").value);
    const instructions = document.getElementById("instructions").value.trim();
    const imageURL = document.getElementById("imageURL").value.trim();

    if (!name || !cuisine || !dietType || !difficulty || !cookingTime || !instructions) {
        alert("Please fill all required fields.");
        return;
    }

    const form = document.getElementById("addRecipeForm");
    const recipeID = form.getAttribute("data-id");
    const isEdit = !!recipeID;

    const url = isEdit
        ? `http://localhost:5001/api/recipes/${recipeID}`
        : "http://localhost:5001/api/recipes";

    const method = isEdit ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                adminID,
                name,
                cuisine,
                dietType,
                difficulty,
                cookingTime,
                instructions,
                imageURL
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || (isEdit ? "Update failed" : "Add failed"));
        }

        alert(isEdit ? "Recipe updated successfully!" : "Recipe added successfully!");

        form.reset();
        form.removeAttribute("data-id");
        form.querySelector("button[type='submit']").textContent = "Add Recipe";

        fetchRecipes();
    } catch (err) {
        console.error(isEdit ? "Update error:" : "Add error:", err);
        alert("Error: " + err.message);
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

async function editRecipe(recipeID) {
    try {
        const response = await fetch(`http://localhost:5001/api/recipes/${recipeID}`);
        if (!response.ok) throw new Error("Failed to fetch recipe details");

        const recipe = await response.json();

        // Fill form with recipe details
        document.getElementById("name").value = recipe.Name;
        document.getElementById("cuisine").value = recipe.Cuisine;
        document.getElementById("diet").value = recipe.DietType;
        document.getElementById("difficulty").value = recipe.Difficulty;
        document.getElementById("cookingTime").value = recipe.CookingTime;
        document.getElementById("instructions").value = recipe.Instructions;
        document.getElementById("imageURL").value = recipe.ImageURL || "";

        // Set edit mode with RecipeID
        const form = document.getElementById("addRecipeForm");
        form.setAttribute("data-id", recipe.RecipeID);

        const submitButton = form.querySelector("button[type='submit']");
        submitButton.textContent = "Update Recipe";
    } catch (error) {
        console.error("Edit error:", error);
        alert("Failed to load recipe for editing.");
    }
}