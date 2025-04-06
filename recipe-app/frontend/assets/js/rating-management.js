document.addEventListener("DOMContentLoaded", function () {
    const ratingsList = document.getElementById("ratings-list");

    // Sample Ratings Data (This would be fetched from a database or API)
    let ratings = [
        {
            ratingID: "R123",
            recipeID: 101,
            userID: 2001,
            rating: 4,
            reviewText: "Great recipe! Will make again.",
        },
        {
            ratingID: "R124",
            recipeID: 102,
            userID: 2002,
            rating: 5,
            reviewText: "Absolutely loved it!",
        },
    ];

    // Function to render ratings in the table
    function renderRatings() {
        // Clear existing rows
        ratingsList.innerHTML = `
            <tr>
                <th>Rating ID</th>
                <th>Recipe ID</th>
                <th>User ID</th>
                <th>Rating</th>
                <th>Review Text</th>
                <th>Actions</th>
            </tr>`;

        // Append each rating to the table
        ratings.forEach((rating, index) => {
            const ratingRow = document.createElement("tr");
            ratingRow.innerHTML = `
                <td>${rating.ratingID}</td>
                <td>${rating.recipeID}</td>
                <td>${rating.userID}</td>
                <td>${rating.rating}</td>
                <td>${rating.reviewText}</td>
                <td><button onclick="editRating(${index})">Edit</button> <button onclick="deleteRating(${index})">Delete</button></td>
            `;
            ratingsList.appendChild(ratingRow);
        });
    }

    // Function to edit a rating (This could open a form for editing in a real application)
    window.editRating = function (index) {
        const rating = ratings[index];
        console.log("Editing Rating:", rating);
        // You can add logic to edit the rating, like showing a form pre-filled with the rating details
    };

    // Function to delete a rating
    window.deleteRating = function (index) {
        if (confirm("Are you sure you want to delete this rating?")) {
            ratings.splice(index, 1); // Remove the rating from the array
            renderRatings(); // Re-render the table
        }
    };

    // Initial render of the ratings
    renderRatings();
});