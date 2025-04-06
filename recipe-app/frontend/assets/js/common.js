document.addEventListener("DOMContentLoaded", () => {
    setupNavMenu();
    setupFormValidation();
    setupSmoothScrolling();
    setupDarkMode();
});

function setupNavMenu() {
    const menuToggle = document.querySelector("#menu-toggle");
    const navMenu = document.querySelector("#nav-menu");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            const isActive = navMenu.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", isActive);
        });

        document.addEventListener("click", (event) => {
            if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
                navMenu.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }
}

function setupFormValidation() {
    document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", (event) => {
            let isValid = true;

            form.querySelectorAll("input[required]").forEach((input) => {
                if (!input.value.trim()) {
                    isValid = false;
                    showError(input, "This field is required.");
                } else {
                    clearError(input);
                }
            });

            const emailInput = form.querySelector("input[type='email']");
            if (emailInput && !isValidEmail(emailInput.value)) {
                isValid = false;
                showError(emailInput, "Enter a valid email.");
            }

            const passwordInput = form.querySelector("input[type='password']");
            if (passwordInput && !isStrongPassword(passwordInput.value)) {
                isValid = false;
                showError(passwordInput, "Must be 8+ chars, include letters & numbers.");
            }

            if (!isValid) event.preventDefault();
        });
    });
}

function showError(input, message) {
    let error = input.nextElementSibling;
    if (!error || !error.classList.contains("error-text")) {
        error = document.createElement("span");
        error.classList.add("error-text");
        input.parentNode.appendChild(error);
    }
    error.textContent = message;
    input.classList.add("input-error");
}

function clearError(input) {
    const error = input.nextElementSibling;
    if (error && error.classList.contains("error-text")) {
        error.remove();
    }
    input.classList.remove("input-error");
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
    return /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password);
}

function setupSmoothScrolling() {
    document.querySelectorAll("a[href^='#']").forEach((anchor) => {
        anchor.addEventListener("click", (event) => {
            event.preventDefault();
            const targetId = anchor.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}

function setupDarkMode() {
    const darkModeToggle = document.querySelector("#dark-mode-toggle");
    if (!darkModeToggle) return;

    const isDarkMode = localStorage.getItem("dark-mode") === "enabled";
    if (isDarkMode) document.body.classList.add("dark-mode");

    darkModeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
    });
}