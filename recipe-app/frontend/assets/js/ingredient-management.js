document.addEventListener("DOMContentLoaded", function () {
    const ingredientForm = document.getElementById("ingredient-form");
    const searchBox = document.getElementById("searchBox");
    const ingredientListBody = document.getElementById("ingredient-list-body");

    // Ensure search works when typing
    searchBox.addEventListener("keyup", searchIngredients);

    // Fetch ingredients from backend
    async function fetchIngredients() {
        try {
            const response = await fetch("http://localhost:5001/api/ingredients");
            const ingredients = await response.json();
            renderIngredients(ingredients);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    }

    // Render ingredients in table
    function renderIngredients(ingredients) {
        ingredientListBody.innerHTML = ""; // Clear previous entries

        ingredients.forEach((ingredient) => {
            console.log("Rendering ingredient:", ingredient);

            const { IngredientID, Name, NutritionalValue } = ingredient;

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${Name}</td>
                <td>${NutritionalValue}</td>
                <td>
                    <button onclick="editIngredient(${IngredientID}, '${Name}', ${NutritionalValue})">Edit</button>
                    <button onclick="deleteIngredient(${IngredientID})">Delete</button>
                </td>`;
            ingredientListBody.appendChild(row);
        });

        searchIngredients(); // Apply search filter after rendering
    }

    // Search function
    function searchIngredients() {
        let input = searchBox.value.toLowerCase();
        let rows = document.querySelectorAll("#ingredient-list-body tr");

        rows.forEach(row => {
            let nameCell = row.cells[0]; // First column (Name)
            if (nameCell) {
                let nameText = nameCell.textContent.toLowerCase();
                row.style.display = nameText.includes(input) ? "" : "none";
            }
        });
    }

    // Initial load
    fetchIngredients();
});