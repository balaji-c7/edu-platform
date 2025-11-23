// edu-platform-frontend/js/script.js

// ===============================
// ✅ Base API URL (Intranet)
// ===============================
const API_BASE_URL = "http://192.168.31.141:5000/api";

// ===============================
// 🧩 Helper Functions
// ===============================
function saveUserData(token, role, name, id) {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("name", name);
  localStorage.setItem("userId", id);
}

function getToken() {
  return localStorage.getItem("token");
}

function getUserRole() {
  return localStorage.getItem("role");
}

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
      const { token, user } = data; // user = { id, name, role }

      saveUserData(token, user.role, user.name, user.id);
      alert("Login successful!");

      if (user.role === "admin" || user.role === "teacher") {
        window.location.href = "teacher-dashboard.html";
      } else {
        window.location.href = "dashboard.html"; // student dashboard
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
// 📚 STUDENT DASHBOARD DATA FETCH
// ===============================
async function loadDashboardData() {
  console.log("🔁 loadDashboardData called");
  const token = getToken();
  const role = getUserRole();
  const name = localStorage.getItem("name") || "";

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) {
    welcomeText.textContent = `Welcome, ${name}! (${role})`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/classroom/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("📦 /classroom/my response:", data);

    const classroomList = document.getElementById("classroomList");
    if (!classroomList) return;

    classroomList.innerHTML = "";

    if (response.ok && Array.isArray(data) && data.length > 0) {
      data.forEach((cls) => {
        const div = document.createElement("div");
        div.className = "classroom-card";
        div.innerHTML = `
          <h3>${cls.name}</h3>
          <p><strong>Created by:</strong> ${cls.createdBy?.name || "N/A"}</p>
          <p><strong>Members:</strong> ${cls.members?.length || 0}</p>
          <p><small>ID: ${cls._id}</small></p>
          <button class="view-res-btn" data-id="${cls._id}" data-name="${
          cls.name
        }">
            View Resources
          </button>
        `;
        classroomList.appendChild(div);
      });

      attachResourceButtonEvents();
    } else {
      classroomList.innerHTML =
        "<p>You are not enrolled in any classrooms yet.</p>";
    }
  } catch (error) {
    console.error("Error loading classrooms:", error);
  }
}

function attachResourceButtonEvents() {
  const buttons = document.querySelectorAll(".view-res-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const name = btn.getAttribute("data-name") || "Classroom";
      window.location.href = `class-resources.html?classroomId=${id}&name=${encodeURIComponent(
        name
      )}`;
    });
  });
}

// ===============================
// 🏫 CLASSROOM PAGE (dynamic list)
// ===============================
async function loadClassroomsPage() {
  console.log("🔁 loadClassroomsPage called");
  const grid = document.getElementById("classroomGrid");
  if (!grid) {
    console.log("⚠️ classroomGrid not found");
    return;
  }

  const token = getToken();
  if (!token) {
    grid.innerHTML =
      "<p>Please <a href='login.html'>login</a> to view available classrooms.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/classroom/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log("📦 /classroom/all response:", data);

    grid.innerHTML = "";

    if (response.ok && Array.isArray(data) && data.length > 0) {
      data.forEach((cls) => {
        const div = document.createElement("div");
        div.className = "classroom-card";
        div.innerHTML = `
          <h3>${cls.name}</h3>
          <p><strong>Created by:</strong> ${cls.createdBy?.name || "N/A"}</p>
          <p><strong>Members:</strong> ${cls.members?.length || 0}</p>
          <p><small>ID: ${cls._id}</small></p>
        `;
        grid.appendChild(div);
      });
    } else if (response.status === 403) {
      grid.innerHTML =
        "<p>Access denied. You are not allowed to view classrooms.</p>";
    } else {
      grid.innerHTML = "<p>No classrooms available yet.</p>";
    }
  } catch (error) {
    console.error("Error loading classrooms:", error);
    grid.innerHTML = "<p>Failed to load classrooms. Try again later.</p>";
  }
}

// ===============================
// 📂 CLASS RESOURCES PAGE
// ===============================
async function loadClassResourcesPage() {
  console.log("🔁 loadClassResourcesPage called");
  const token = getToken();
  const params = new URLSearchParams(window.location.search);
  const classroomId = params.get("classroomId");
  const className = params.get("name")
    ? decodeURIComponent(params.get("name"))
    : "Classroom";

  const titleEl = document.getElementById("classResTitle");
  const listEl = document.getElementById("resourceList");

  if (!titleEl || !listEl) return;

  titleEl.textContent = `Resources for "${className}"`;

  if (!token) {
    listEl.innerHTML =
      "<p>Please <a href='login.html'>login</a> to view resources.</p>";
    return;
  }

  if (!classroomId) {
    listEl.innerHTML = "<p>Invalid classroom. No ID provided.</p>";
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/resources/classroom/${classroomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    console.log("📦 /resources/classroom response:", data);

    listEl.innerHTML = "";

    if (response.ok && Array.isArray(data) && data.length > 0) {
      data.forEach((resItem) => {
        const div = document.createElement("div");
        div.className = "classroom-card";
        div.innerHTML = `
          <h3>${resItem.title}</h3>
          <p>${resItem.description || "No description"}</p>
          <p><a href="${resItem.url}" target="_blank">Open Resource 🔗</a></p>
          <p><small>Uploaded at: ${new Date(
            resItem.createdAt
          ).toLocaleString()}</small></p>
        `;
        listEl.appendChild(div);
      });
    } else if (response.ok && data.length === 0) {
      listEl.innerHTML = "<p>No resources uploaded yet for this classroom.</p>";
    } else {
      listEl.innerHTML = `<p>${
        data.message || "Failed to load resources."
      }</p>`;
    }
  } catch (error) {
    console.error("Error loading class resources:", error);
    listEl.innerHTML = "<p>Error loading resources. Try again later.</p>";
  }
}

// ===============================
// 🧭 EVENT LISTENERS (element-based)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOMContentLoaded");

  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const logoutBtn = document.getElementById("logoutBtn");
  const classroomListEl = document.getElementById("classroomList");
  const classroomGridEl = document.getElementById("classroomGrid");
  const resourceListEl = document.getElementById("resourceList");

  if (loginForm) {
    console.log("🧩 Login form detected");
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    console.log("🧩 Signup form detected");
    signupForm.addEventListener("submit", handleSignup);
  }

  if (logoutBtn) {
    console.log("🧩 Logout button detected");
    logoutBtn.addEventListener("click", logout);
  }

  // If this page has student's classroom list
  if (classroomListEl) {
    loadDashboardData();
  }

  // If this page has the classroom grid (classroom.html)
  if (classroomGridEl) {
    loadClassroomsPage();
  }

  // If this page has the resource list (class-resources.html)
  if (resourceListEl) {
    loadClassResourcesPage();
  }
});
