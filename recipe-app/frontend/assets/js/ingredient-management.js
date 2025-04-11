
document.addEventListener("DOMContentLoaded", function () {
    const ingredientForm = document.getElementById("ingredient-form");
    const searchBox = document.getElementById("searchBox");
    const ingredientListBody = document.getElementById("ingredient-list-body");

    let editingIngredientID = null;

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

    // Render ingredients
    function renderIngredients(ingredients) {
        ingredientListBody.innerHTML = "";
        ingredients.forEach((ingredient) => {
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
        searchIngredients();
    }

    // Add or update ingredient
    ingredientForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const nutritionalValue = parseFloat(document.getElementById("nutritionalValue").value);

        if (!name || isNaN(nutritionalValue)) return;

        const data = { name, nutritionalValue };

        try {
            if (editingIngredientID) {
                // Update existing ingredient
                await fetch(`http://localhost:5001/api/ingredients/${editingIngredientID}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
                editingIngredientID = null;
            } else {
                // Create new ingredient
                await fetch("http://localhost:5001/api/ingredients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });
            }
            ingredientForm.reset();
            fetchIngredients();
        } catch (error) {
            console.error("Save error:", error);
        }
    });

    // Expose edit function globally
    window.editIngredient = function (id, name, nutritionalValue) {
        document.getElementById("name").value = name;
        document.getElementById("nutritionalValue").value = nutritionalValue;
        editingIngredientID = id;
    };

    // Delete ingredient
    window.deleteIngredient = async function (id) {
        if (confirm("Are you sure you want to delete this ingredient?")) {
            try {
                await fetch(`http://localhost:5001/api/ingredients/${id}`, {
                    method: "DELETE"
                });
                fetchIngredients();
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    // Search
    searchBox.addEventListener("keyup", searchIngredients);
    function searchIngredients() {
        let input = searchBox.value.toLowerCase();
        let rows = document.querySelectorAll("#ingredient-list-body tr");
        rows.forEach(row => {
            let nameCell = row.cells[0];
            if (nameCell) {
                let nameText = nameCell.textContent.toLowerCase();
                row.style.display = nameText.includes(input) ? "" : "none";
            }
        });
    }

    // Initial fetch
    fetchIngredients();
});
