document.addEventListener("DOMContentLoaded", function () {
    const tableBody = document.querySelector("#includes-table tbody");
    const addRowBtn = document.getElementById("add-row-btn");
    const searchInput = document.getElementById("ingredientSearch");
    const suggestionsBox = document.getElementById("suggestions");

    // Retrieve the recipe ID from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const recipeID = urlParams.get("recipeID");

    // Redirect if no Recipe ID is provided
    if (!recipeID) {
        alert("No Recipe ID provided. Redirecting...");
        window.location.href = "recipe-management.html";
        return;
    }

    // Function to fetch includes data from the backend
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

    // Function to add a row to the table
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

        // Add event listeners to buttons
        row.querySelector(".save-btn").addEventListener("click", () => saveRow(row));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteRow(row));

        tableBody.appendChild(row);
    }

    // Function to save a row to the database
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

    // Function to delete a row from the database
    async function deleteRow(row) {
        const recipeID = row.children[0].textContent.trim();
        const ingredientID = row.children[1].textContent.trim();

        if (!confirm(`Are you sure you want to delete this ingredient (${ingredientID}) from recipe (${recipeID})?`)) return;

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

    // Function to show messages (success or error)
    function showMessage(message, type) {
        const alertDiv = document.createElement("div");
        alertDiv.textContent = message;
        alertDiv.classList.add(type === "success" ? "alert-success" : "alert-error");
        document.body.appendChild(alertDiv);
        setTimeout(() => alertDiv.remove(), 3000); // Remove message after 3 seconds
    }

    // Event listener for adding a new row
    addRowBtn.addEventListener("click", () => addRowToTable());

    // --- Dynamic Ingredient Search ---
    if (searchInput) {
        searchInput.addEventListener("input", async () => {
            const query = searchInput.value.trim();
            if (!query) {
                suggestionsBox.innerHTML = "";
                return;
            }

            console.log("Searching for:", query); // Log the query to check if it's correct

            try {
                const response = await fetch(`http://localhost:5001/api/ingredients/search?name=${encodeURIComponent(query)}`);
                
                if (!response.ok) {
                    console.error("Failed to fetch data for ingredients");
                    return;
                }

                const ingredients = await response.json();
                console.log("Search Results:", ingredients); // Log the returned ingredients

                suggestionsBox.innerHTML = ""; // Clear the suggestions box

                if (ingredients.length > 0) {
                    ingredients.forEach(ingredient => {
                        const div = document.createElement("div");
                        div.textContent = `${ingredient.Name} (ID: ${ingredient.IngredientID})`;
                        div.addEventListener("click", () => {
                            searchInput.value = ingredient.Name;
                            suggestionsBox.innerHTML = "";

                            // Auto-fill into a new row
                            addRowToTable({
                                RecipeID: recipeID,
                                IngredientID: ingredient.IngredientID,
                                Quantity: "" // Leave quantity for user to fill
                            });
                        });
                        suggestionsBox.appendChild(div);
                    });
                } else {
                    suggestionsBox.innerHTML = "<div>No results found</div>";
                }
            } catch (err) {
                console.error("Search error:", err);
            }
        });
    }

    // Fetch and populate the table with initial data
    fetchIncludesData();
});