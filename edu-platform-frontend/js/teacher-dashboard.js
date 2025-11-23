// edu-platform-frontend/js/teacher-dashboard.js

const apiBase = "http://192.168.31.141:5000/api";

document.addEventListener("DOMContentLoaded", () => {
  const userNameElement = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("name") || "Teacher";

  if (!token) {
    alert("Please log in first!");
    window.location.href = "login.html";
    return;
  }

  if (userNameElement) userNameElement.textContent = userName;

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  setupCreateClassroom(token);
  setupAddStudent(token);
  setupUploadResource(token);
  setupUploadAssignment(token);
});

// ---------------- CREATE CLASSROOM ----------------
function setupCreateClassroom(token) {
  const form = document.getElementById("createClassroomForm");
  const msg = document.getElementById("createClassMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("classroomName").value;
    const expiresAt = document.getElementById("classroomExpiry").value;

    try {
      const res = await fetch(`${apiBase}/classroom/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, expiresAt }),
      });
      const data = await res.json();
      msg.textContent = data.message;
      msg.style.color = res.ok ? "green" : "red";
      if (res.ok) form.reset();
    } catch (err) {
      msg.textContent = "Error creating classroom";
      msg.style.color = "red";
      console.error(err);
    }
  });
}

// ---------------- ADD STUDENT ----------------
function setupAddStudent(token) {
  const form = document.getElementById("addStudentForm");
  const msg = document.getElementById("addStudentMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const classroomName = document.getElementById("classroomName").value;
    const studentEmail = document.getElementById("studentEmail").value;

    try {
      const res = await fetch(`${apiBase}/classroom/add-student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ classroomName, studentEmail }),
      });

      const data = await res.json();
      msg.textContent = data.message || "Done";
      msg.style.color = res.ok ? "green" : "red";
      if (res.ok) form.reset();
    } catch (err) {
      msg.textContent = "Error adding student";
      msg.style.color = "red";
      console.error(err);
    }
  });
}

// ---------------- UPLOAD RESOURCE ----------------
function setupUploadResource(token) {
  const form = document.getElementById("uploadResourceForm");
  const msg = document.getElementById("uploadResourceMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("resourceTitle").value;
    const url = document.getElementById("resourceUrl").value;
    const classroomId = document.getElementById("resourceClassroomId").value;
    const description = document.getElementById("resourceDescription").value;

    try {
      const res = await fetch(`${apiBase}/resources/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, url, classroomId, description }),
      });
      const data = await res.json();
      msg.textContent = data.message;
      msg.style.color = res.ok ? "green" : "red";
      if (res.ok) form.reset();
    } catch (err) {
      msg.textContent = "Error uploading resource";
      msg.style.color = "red";
      console.error(err);
    }
  });
}

// ---------------- UPLOAD ASSIGNMENT ----------------
function setupUploadAssignment(token) {
  const form = document.getElementById("uploadAssignmentForm");
  const msg = document.getElementById("uploadAssignmentMsg");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("assignmentTitle").value;
    const description = document.getElementById("assignmentDescription").value;
    const dueDate = document.getElementById("assignmentDueDate").value;
    const classroomId = document.getElementById("assignmentClassroomId").value;
    const file = document.getElementById("assignmentFile").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);
    formData.append("classroomId", classroomId);
    formData.append("file", file);

    try {
      const res = await fetch(`${apiBase}/assignments/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      msg.textContent = data.message;
      msg.style.color = res.ok ? "green" : "red";
      if (res.ok) form.reset();
    } catch (err) {
      msg.textContent = "Error uploading assignment";
      msg.style.color = "red";
      console.error(err);
    }
  });
}
