// ===============================
// ✅ Common Frontend Script
// ===============================

// Base API URL
const API_BASE_URL = "http://localhost:5000/api";

// ===============================
// 🧩 Helper Functions
// ===============================

// Save token and role in localStorage
function saveUserData(token, role, name) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("name", name);
}

// Get stored token
function getToken() {
  return localStorage.getItem("token");
}

// Get user role
function getUserRole() {
  return localStorage.getItem("role");
}

// Logout user
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ===============================
// 🧠 LOGIN FUNCTIONALITY
// ===============================
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      saveUserData(data.token, data.role, data.name);
      alert("Login successful!");

      // Redirect based on role
      if (data.role === "admin" || data.role === "teacher") {
        window.location.href = "dashboard.html";
      } else {
        window.location.href = "teacher-dashboard.html";
      }
    } else {
      alert(data.message || "Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Server error. Try again later.");
  }
}

// ===============================
// 🧠 SIGNUP FUNCTIONALITY
// ===============================
async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("signupName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Signup successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("An error occurred during signup.");
  }
}

// ===============================
// 📚 DASHBOARD DATA FETCH
// ===============================
async function loadDashboardData() {
  const token = getToken();
  const role = getUserRole();
  const name = localStorage.getItem("name");

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  // Show welcome message
  const userWelcome = document.getElementById("userWelcome");
  if (userWelcome) userWelcome.textContent = `Welcome, ${name}!`;

  try {
    const response = await fetch(`${API_BASE_URL}/classroom`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    const classList = document.getElementById("classList");
    if (classList) {
      classList.innerHTML = "";
      if (response.ok && data.length > 0) {
        data.forEach((cls) => {
          const div = document.createElement("div");
          div.className = "classroom-card";
          div.innerHTML = `
            <h3>${cls.name}</h3>
            <p>${cls.description || "No description"}</p>
            <p><strong>Teacher:</strong> ${cls.teacher?.name || "N/A"}</p>
          `;
          classList.appendChild(div);
        });
      } else {
        classList.innerHTML = "<p>No classrooms found.</p>";
      }
    }
  } catch (error) {
    console.error("Error loading classrooms:", error);
  }
}

// ===============================
// 🧭 EVENT LISTENERS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // Dashboard data auto-load
  if (window.location.pathname.includes("dashboard.html")) {
    loadDashboardData();
  }
});
