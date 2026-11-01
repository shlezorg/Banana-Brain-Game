/*
 * Banana Brain Challenge
 * Login, Registration and Dashboard
 * Version: 1.0.0
 *
 * DEMONSTRATION ONLY:
 * This prototype uses browser localStorage.
 * It is not production-ready authentication.
 */

const USERS_KEY = "bananaBrainUsers";
const SESSION_KEY = "bananaBrainCurrentUser";

// Get all registered users
function readUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// Save users in browser storage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Get currently logged-in user
function getCurrentUser() {
    const email = localStorage.getItem(SESSION_KEY);

    if (!email) {
        return null;
    }

    return readUsers().find(user => user.email === email) || null;
}

// Display form messages
function showMessage(element, message, type = "error") {
    if (!element) return;

    element.textContent = message;
    element.className = `form-message ${type}`;
}


/* ==================================
   REGISTRATION
================================== */

const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document
            .getElementById("register-name")
            .value.trim();

        const email = document
            .getElementById("register-email")
            .value.trim()
            .toLowerCase();

        const password = document
            .getElementById("register-password")
            .value;

        const confirmPassword = document
            .getElementById("confirm-password")
            .value;

        const message = document.getElementById("register-message");

        // Check empty fields
        if (!name || !email || !password || !confirmPassword) {

            showMessage(message, "Please complete all fields.");
            return;
        }

        // Validate password length
        if (password.length < 6) {

            showMessage(
                message,
                "Your password must contain at least 6 characters."
            );

            return;
        }

        // Confirm password
        if (password !== confirmPassword) {

            showMessage(
                message,
                "The passwords do not match."
            );

            return;
        }

        const users = readUsers();

        // Check existing email
        const existingUser = users.find(
            user => user.email === email
        );

        if (existingUser) {

            showMessage(
                message,
                "An account with this email already exists."
            );

            return;
        }

        // Create new player
        const newUser = {

            name: name,
            email: email,

            // Demo only: plain-text password storage is insecure.
            password: password,

            bestScore: 0,
            gamesPlayed: 0,
            totalCorrect: 0,

            createdAt: new Date().toISOString()
        };

        users.push(newUser);

        saveUsers(users);

        // Automatically log in
        localStorage.setItem(SESSION_KEY, email);

        showMessage(
            message,
            "Account created successfully!",
            "success"
        );

        window.location.href = "dashboard.html";

    });

}


/* ==================================
   LOGIN
================================== */

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document
            .getElementById("login-email")
            .value.trim()
            .toLowerCase();

        const password = document
            .getElementById("login-password")
            .value;

        const message = document.getElementById("login-message");

        const users = readUsers();

        // Find matching account
        const user = users.find(function(item) {

            return item.email === email &&
                   item.password === password;

        });

        if (!user) {

            showMessage(
                message,
                "Email or password is incorrect."
            );

            return;
        }

        // Create login session
        localStorage.setItem(SESSION_KEY, user.email);

        showMessage(
            message,
            "Login successful!",
            "success"
        );

        window.location.href = "dashboard.html";

    });

}


/* ==================================
   DASHBOARD
================================== */

const dashboardPage = document.querySelector(".dashboard-content");

if (dashboardPage) {

    const user = getCurrentUser();

    // Redirect unauthenticated users
    if (!user) {

        window.location.replace("login.html");

    } else {

        const firstName = user.name.split(" ")[0];

        const initial = user.name
            .charAt(0)
            .toUpperCase();

        // Display player details
        document.getElementById("header-name").textContent =
            user.name;

        document.getElementById("welcome-name").textContent =
            firstName;

        document.getElementById("profile-name").textContent =
            user.name;

        document.getElementById("profile-email").textContent =
            user.email;

        document.getElementById("user-avatar").textContent =
            initial;

        document.getElementById("profile-avatar").textContent =
            initial;

        // Display statistics
        document.getElementById("best-score").textContent =
            user.bestScore || 0;

        document.getElementById("games-played").textContent =
            user.gamesPlayed || 0;

        document.getElementById("total-correct").textContent =
            user.totalCorrect || 0;

        // Account creation date
        const date = new Date(user.createdAt);

        document.getElementById("member-since").textContent =
            Number.isNaN(date.getTime())
                ? "—"
                : date.toLocaleDateString();

        // Logout
        document
            .getElementById("logout-button")
            .addEventListener("click", function() {

                localStorage.removeItem(SESSION_KEY);

                window.location.href = "login.html";

            });

    }

}


/* ==================================
   AUTHENTICATION PAGE REDIRECTION
================================== */

// If already logged in, redirect to dashboard
if ((loginForm || registerForm) && getCurrentUser()) {

    window.location.replace("dashboard.html");

}