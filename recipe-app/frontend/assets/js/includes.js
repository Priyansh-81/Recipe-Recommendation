document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#includes-table tbody");
    const addRowBtn = document.getElementById("add-row-btn");
    const searchInput = document.getElementById("ingredientSearch");
    const suggestionsBox = document.getElementById("suggestions");

    const urlParams = new URLSearchParams(window.location.search);
    const recipeID = urlParams.get("recipeID");

    if (!recipeID) {
        alert("No Recipe ID provided. Redirecting...");
        window.location.href = "recipe-management.html";
        return;
    }

    async function fetchIncludesData() {
        try {
            const response = await fetch(`http://localhost:5001/api/includes?recipeID=${recipeID}`);
            if (!response.ok) throw new Error("Failed to fetch includes data");

            const data = await response.json();
            data.forEach(row => addRowToTable(row));
        } catch (error) {
            showMessage("Error fetching includes data: " + error.message, "error");
        }
    }

    function addRowToTable(rowData = { RecipeID: recipeID, IngredientID: "", Quantity: "" }) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td contenteditable="false">${rowData.RecipeID}</td>
            <td contenteditable="true">${rowData.IngredientID}</td>
            <td contenteditable="true">${rowData.Quantity}</td>
            <td>
                <button class="save-btn">Save</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;

        row.querySelector(".save-btn").addEventListener("click", () => saveRow(row));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteRow(row));

        tableBody.appendChild(row);
    }

    async function saveRow(row) {
        const recipeID = row.children[0].textContent.trim();
        const ingredientID = row.children[1].textContent.trim();
        const quantity = row.children[2].textContent.trim();

        if (!ingredientID || !quantity) {
            showMessage("Ingredient ID and Quantity are required.", "error");
            return;
        }

        try {
            const response = await fetch("http://localhost:5001/api/includes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ RecipeID: recipeID, IngredientID: ingredientID, Quantity: quantity }),
            });

            if (response.ok) {
                showMessage("Row saved successfully!", "success");
            } else {
                throw new Error("Failed to save row.");
            }
        } catch (error) {
            showMessage("Error saving row: " + error.message, "error");
        }
    }

    async function deleteRow(row) {
        const recipeID = row.children[0].textContent.trim();
        const ingredientID = row.children[1].textContent.trim();

        if (!confirm(`Delete ingredient (${ingredientID}) from recipe (${recipeID})?`)) return;

        try {
            const response = await fetch(`http://localhost:5001/api/includes/${recipeID}/${ingredientID}`, {
                method: "DELETE",
            });

            if (response.ok) {
                showMessage("Row deleted successfully!", "success");
                row.remove();
            } else {
                throw new Error("Failed to delete row.");
            }
        } catch (error) {
            showMessage("Error deleting row: " + error.message, "error");
        }
    }

    function showMessage(message, type) {
        const alertDiv = document.createElement("div");
        alertDiv.textContent = message;
        alertDiv.classList.add(type === "success" ? "alert-success" : "alert-error");
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    addRowBtn.addEventListener("click", () => addRowToTable());

    // --- Ingredient Search with Suggestions ---
    if (searchInput) {
        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();
            suggestionsBox.innerHTML = "";

            if (!query) return;

            try {
                const response = await fetch(`http://localhost:5001/api/ingredients/search?name=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error("Failed to fetch ingredient data");

                const ingredients = await response.json();

                if (ingredients.length > 0) {
                    ingredients.forEach(ingredient => {
                        const div = document.createElement("div");
                        div.className = "suggestion-item";
                        div.textContent = `${ingredient.Name} (ID: ${ingredient.IngredientID})`;

                        div.addEventListener("click", () => {
                            searchInput.value = "";
                            suggestionsBox.innerHTML = "";

                            addRowToTable({
                                RecipeID: recipeID,
                                IngredientID: ingredient.IngredientID,
                                Quantity: ""
                            });
                        });

                        suggestionsBox.appendChild(div);
                    });
                } else {
                    suggestionsBox.innerHTML = "<div class='suggestion-item'>No results found</div>";
                }
            } catch (err) {
                console.error("Search error:", err);
                suggestionsBox.innerHTML = "<div class='suggestion-item'>Error fetching results</div>";
            }
        });

        // Optional: hide suggestion box on outside click
        document.addEventListener("click", (e) => {
            if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
                suggestionsBox.innerHTML = "";
            }
        });
    }

    fetchIncludesData();
});