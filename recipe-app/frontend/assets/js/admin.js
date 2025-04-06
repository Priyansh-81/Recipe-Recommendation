document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form");

    forms.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Prevent actual form submission

            let valid = true;
            const inputs = form.querySelectorAll("input, select");

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    alert(`${input.previousElementSibling.textContent} is required.`);
                    valid = false;
                    return;
                }
            });

            if (valid) {
                alert("Form submitted successfully!");
                form.reset(); // Reset form after successful validation
            }
        });
    });

    // Function to handle dynamic ingredient addition
    if (document.querySelector("#name") && document.querySelector("#quantity")) {
        const ingredientForm = document.querySelector("form");
        const ingredientTable = document.querySelector("table");

        ingredientForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.querySelector("#name").value.trim();
            const quantity = document.querySelector("#quantity").value.trim();
            const unit = document.querySelector("#unit").value;

            if (name && quantity) {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${name}</td>
                    <td>${quantity}</td>
                    <td>${unit}</td>
                    <td><button class="edit-btn">Edit</button> <button class="delete-btn">Delete</button></td>
                `;
                ingredientTable.appendChild(newRow);

                document.querySelector("#name").value = "";
                document.querySelector("#quantity").value = "";
            }
        });

        // Delete & Edit buttons for table rows
        ingredientTable.addEventListener("click", function (event) {
            if (event.target.classList.contains("delete-btn")) {
                event.target.parentElement.parentElement.remove();
            } else if (event.target.classList.contains("edit-btn")) {
                const row = event.target.parentElement.parentElement;
                document.querySelector("#name").value = row.cells[0].textContent;
                document.querySelector("#quantity").value = row.cells[1].textContent;
                document.querySelector("#unit").value = row.cells[2].textContent;
                row.remove();
            }
        });

        document.addEventListener("DOMContentLoaded", function () {
            const forms = document.querySelectorAll("form");
        
            forms.forEach(form => {
                form.addEventListener("submit", function (event) {
                    event.preventDefault(); // Prevent default submission
        
                    let valid = true;
                    const inputs = form.querySelectorAll("input, select");
                    const messageBox = document.querySelector(".message-box");
                    const loader = document.querySelector(".spinner");
        
                    inputs.forEach(input => {
                        if (!input.value.trim()) {
                            showMessage(`❌ ${input.previousElementSibling.textContent} is required.`, "error");
                            valid = false;
                            return;
                        }
                    });
        
                    if (valid) {
                        loader.style.display = "block"; // Show loader
        
                        // Simulate processing delay
                        setTimeout(() => {
                            loader.style.display = "none"; // Hide loader
                            showMessage("✅ Form submitted successfully!", "success");
                            form.reset(); // Reset form
                        }, 1500);
                    }
                });
            });
        
            function showMessage(msg, type) {
                const messageBox = document.querySelector(".message-box");
                messageBox.textContent = msg;
                messageBox.className = `message-box ${type}`;
                messageBox.style.display = "block";
        
                setTimeout(() => {
                    messageBox.style.opacity = "0"; // Fade out
                    setTimeout(() => messageBox.style.display = "none", 300);
                }, 2000);
            }
        });
    }
});