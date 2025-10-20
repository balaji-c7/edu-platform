const API_URL = "http://localhost:5000/api";

// ------------------- SIGNUP -------------------
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const role = document.getElementById("signupRole").value;

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }

      alert("Signup successful! Please login.");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Error: Unable to signup");
    }
  });
}

// ------------------- LOGIN -------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userRole", data.user.role);

      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      alert("Error: Unable to login");
    }
  });
}

// ------------------- DASHBOARD -------------------
const classroomList = document.getElementById("classroomList");
if (classroomList) {
  document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");

    if (!token) {
      window.location.href = "login.html";
      return;
    }

    document.getElementById("welcomeText").innerText = `Hello, ${userName}!`;

    try {
      const res = await fetch(`${API_URL}/classroom/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load classrooms");
        return;
      }

      if (data.length === 0) {
        classroomList.innerHTML = "<p>No classrooms yet.</p>";
        return;
      }

      classroomList.innerHTML = data
        .map(
          (c) => `
        <div class="classroom-card">
          <h3>${c.name}</h3>
          <p>${c.description || "No description"}</p>
          <button onclick="openClassroom('${c._id}')">Open</button>
        </div>
      `
        )
        .join("");
    } catch (err) {
      console.error(err);
      classroomList.innerHTML = "<p>Error loading classrooms.</p>";
    }
  });
}

// ------------------- LOGOUT -------------------
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ------------------- CLASSROOM PAGE REDIRECT -------------------
function openClassroom(id) {
  window.location.href = `classroom.html?id=${id}`;
}
