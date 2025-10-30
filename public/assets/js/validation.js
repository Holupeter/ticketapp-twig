document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  // Show/hide password
  document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", () => {
      const input = document.getElementById(icon.dataset.target);
      input.type = input.type === "password" ? "text" : "password";
    });
  });

  // Email validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password);

  // Login validation
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      let valid = true;
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      if (!validateEmail(email)) {
        document.getElementById("emailError").textContent = "Please enter a valid email.";
        valid = false;
      } else {
        document.getElementById("emailError").textContent = "";
      }

      if (!validatePassword(password)) {
        document.getElementById("passwordError").textContent =
          "Password must be at least 8 characters and include letters, numbers, and a symbol.";
        valid = false;
      } else {
        document.getElementById("passwordError").textContent = "";
      }

      if (!valid) e.preventDefault();
    });
  }

  // Signup validation
  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      let valid = true;
      const email = signupForm.email.value.trim();
      const password = signupForm.password.value;
      const confirm = signupForm.confirmPassword.value;

      if (!validateEmail(email)) {
        document.getElementById("emailError").textContent = "Please enter a valid email.";
        valid = false;
      } else {
        document.getElementById("emailError").textContent = "";
      }

      if (!validatePassword(password)) {
        document.getElementById("passwordError").textContent =
          "Password must be at least 8 characters and include letters, numbers, and a symbol.";
        valid = false;
      } else {
        document.getElementById("passwordError").textContent = "";
      }

      if (confirm !== password) {
        document.getElementById("confirmError").textContent = "Passwords do not match.";
        valid = false;
      } else {
        document.getElementById("confirmError").textContent = "";
      }

      if (!valid) e.preventDefault();
    });
  }
});
