// ratings.js

document.addEventListener("DOMContentLoaded", () => {
    loadRatings();
});

// 🟢 1. Load and Display Ratings for a Recipe
function loadRatings() {
    const ratingsContainer = document.querySelector("#ratings");
    if (!ratingsContainer) return;

    let recipeId = ratingsContainer.dataset.recipeId;
    let ratingsData = JSON.parse(localStorage.getItem("ratings")) || {};
    let reviews = ratingsData[recipeId] || [];

    ratingsContainer.innerHTML = reviews.length
        ? reviews.map(review => `
            <div class="review">
                <strong>${review.user}:</strong> <span>⭐ ${review.rating}/5</span>
                <p>${review.text}</p>
            </div>
        `).join("")
        : "<p>No reviews yet. Be the first to rate!</p>";
}

// 🟢 2. Submit a New Rating
function submitRating() {
    const ratingInput = document.querySelector("#ratingValue");
    const reviewInput = document.querySelector("#reviewText");
    let recipeId = document.querySelector("#ratings").dataset.recipeId;
    let user = localStorage.getItem("currentUser") || "Guest";

    let rating = parseInt(ratingInput.value);
    let reviewText = reviewInput.value.trim();

    if (rating < 0 || rating > 5 || isNaN(rating)) {
        alert("Please enter a rating between 0 and 5.");
        return;
    }

    if (!reviewText) {
        alert("Please enter a review.");
        return;
    }

    let ratingsData = JSON.parse(localStorage.getItem("ratings")) || {};
    ratingsData[recipeId] = ratingsData[recipeId] || [];
    ratingsData[recipeId].push({ user, rating, text: reviewText });

    localStorage.setItem("ratings", JSON.stringify(ratingsData));
    ratingInput.value = "";
    reviewInput.value = "";

    loadRatings();
}

// 🟢 3. Attach Event Listener to Submit Button
document.querySelector("#submitRating")?.addEventListener("click", submitRating);