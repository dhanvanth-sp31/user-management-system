/* =========================================================
   User Management System — Frontend Logic
   Talks to the Express backend using the Fetch API.
   Flow: Form/Table -> fetch() -> Express REST API -> MySQL
   ========================================================= */

// -----------------------------------------------------------
// CONFIG
// Change API_BASE_URL to your deployed backend URL in production.
// Example (development):  http://localhost:5000/api/users
// Example (production):   https://your-backend-url.onrender.com/api/users
// -----------------------------------------------------------
const API_BASE_URL = "http://localhost:5000/api/users";

// -----------------------------------------------------------
// DOM ELEMENTS
// -----------------------------------------------------------
const form = document.getElementById("user-form");
const userIdField = document.getElementById("user-id");
const nameField = document.getElementById("name");
const emailField = document.getElementById("email");
const phoneField = document.getElementById("phone");

const nameError = document.getElementById("name-error");
const emailError = document.getElementById("email-error");
const phoneError = document.getElementById("phone-error");

const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formHeading = document.getElementById("form-heading");

const messageBox = document.getElementById("message");
const tableBody = document.getElementById("user-table-body");
const emptyState = document.getElementById("empty-state");
const loadingState = document.getElementById("loading-state");
const refreshBtn = document.getElementById("refresh-btn");

// -----------------------------------------------------------
// INIT
// -----------------------------------------------------------
document.addEventListener("DOMContentLoaded", fetchUsers);
form.addEventListener("submit", handleFormSubmit);
cancelEditBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", fetchUsers);

// -----------------------------------------------------------
// MESSAGE HELPERS
// -----------------------------------------------------------
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.hidden = false;

  // Auto-hide after a few seconds so the UI stays clean
  clearTimeout(showMessage._timer);
  showMessage._timer = setTimeout(() => {
    messageBox.hidden = true;
  }, 4000);
}

function clearFieldErrors() {
  nameError.textContent = "";
  emailError.textContent = "";
  phoneError.textContent = "";
  nameField.classList.remove("invalid");
  emailField.classList.remove("invalid");
  phoneField.classList.remove("invalid");
}

// -----------------------------------------------------------
// VALIDATION (client-side; the backend validates again too)
// -----------------------------------------------------------
function validateForm() {
  clearFieldErrors();
  let isValid = true;

  const name = nameField.value.trim();
  const email = emailField.value.trim();
  const phone = phoneField.value.trim();

  if (name.length < 2) {
    nameError.textContent = "Name must be at least 2 characters.";
    nameField.classList.add("invalid");
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    emailError.textContent = "Enter a valid email address.";
    emailField.classList.add("invalid");
    isValid = false;
  }

  const phonePattern = /^\+?[0-9\s\-]{7,15}$/;
  if (!phonePattern.test(phone)) {
    phoneError.textContent = "Enter a valid phone number (7-15 digits).";
    phoneField.classList.add("invalid");
    isValid = false;
  }

  return isValid;
}

// -----------------------------------------------------------
// API CALLS
// -----------------------------------------------------------

// GET /api/users — fetch and render all users
async function fetchUsers() {
  loadingState.hidden = false;
  emptyState.hidden = true;
  tableBody.innerHTML = "";

  try {
    const response = await fetch(API_BASE_URL);
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to load users.");
    }

    renderUsers(result.data);
  } catch (error) {
    showMessage(error.message || "Could not connect to the server.", "error");
  } finally {
    loadingState.hidden = true;
  }
}

// POST /api/users — create a new user
async function createUser(payload) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json().then((result) => ({ ok: response.ok, result }));
}

// PUT /api/users/:id — update an existing user
async function updateUser(id, payload) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json().then((result) => ({ ok: response.ok, result }));
}

// DELETE /api/users/:id — remove a user
async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  return response.json().then((result) => ({ ok: response.ok, result }));
}

// -----------------------------------------------------------
// RENDERING
// -----------------------------------------------------------
function renderUsers(users) {
  tableBody.innerHTML = "";

  if (!users || users.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(user.phone)}</td>
      <td class="actions-cell">
        <button class="btn btn-edit" data-action="edit" data-id="${user.id}">Edit</button>
        <button class="btn btn-delete" data-action="delete" data-id="${user.id}">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Attach listeners after rows are in the DOM
  tableBody.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.id, users));
  });

  tableBody.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => confirmDelete(btn.dataset.id));
  });
}

// Basic HTML escaping so user input can't break the table markup
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

// -----------------------------------------------------------
// FORM HANDLING (shared by Add and Edit)
// -----------------------------------------------------------
async function handleFormSubmit(event) {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  const payload = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    phone: phoneField.value.trim(),
  };

  const editingId = userIdField.value;
  submitBtn.disabled = true;
  submitBtn.textContent = editingId ? "Saving..." : "Adding...";

  try {
    const { ok, result } = editingId
      ? await updateUser(editingId, payload)
      : await createUser(payload);

    if (!ok || !result.success) {
      throw new Error(result.message || "Something went wrong.");
    }

    showMessage(result.message || "Success.", "success");
    resetForm();
    fetchUsers();
  } catch (error) {
    showMessage(error.message || "Could not save the user.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = editingId ? "Save Changes" : "Add User";
  }
}

function startEdit(id, users) {
  const user = users.find((u) => String(u.id) === String(id));
  if (!user) return;

  userIdField.value = user.id;
  nameField.value = user.name;
  emailField.value = user.email;
  phoneField.value = user.phone;

  formHeading.textContent = "Edit User";
  submitBtn.textContent = "Save Changes";
  cancelEditBtn.hidden = false;

  clearFieldErrors();
  nameField.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  form.reset();
  userIdField.value = "";
  formHeading.textContent = "Add User";
  submitBtn.textContent = "Add User";
  cancelEditBtn.hidden = true;
  clearFieldErrors();
}

async function confirmDelete(id) {
  const confirmed = window.confirm("Delete this user? This cannot be undone.");
  if (!confirmed) return;

  try {
    const { ok, result } = await deleteUser(id);

    if (!ok || !result.success) {
      throw new Error(result.message || "Could not delete user.");
    }

    showMessage(result.message || "User deleted.", "success");

    // If the deleted user was being edited, reset the form
    if (userIdField.value === String(id)) {
      resetForm();
    }

    fetchUsers();
  } catch (error) {
    showMessage(error.message || "Could not delete user.", "error");
  }
}
