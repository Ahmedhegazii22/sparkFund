document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const email = document.getElementById("userEmail").value.trim();
    ``;
    const password = document.getElementById("password").value;
    const rePassword = document.getElementById("rePassword").value;

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const rePasswordError = document.getElementById("rePasswordError");

    [nameError, emailError, passwordError, rePasswordError].forEach(
      (el) => (el.style.display = "none")
    );

    let hasError = false;

    if (!name || name.length < 3) {
      nameError.textContent = "Name must be at least 3 characters.";
      nameError.style.display = "block";
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      emailError.textContent = "Please enter a valid email.";
      emailError.style.display = "block";
      hasError = true;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      passwordError.textContent =
        "Password must be 8+ chars, contain upper, lower, number, and symbol.";
      passwordError.style.display = "block";
      hasError = true;
    }

    if (password !== rePassword) {
      rePasswordError.textContent = "Passwords do not match.";
      rePasswordError.style.display = "block";
      hasError = true;
    }

    if (hasError) return;

    try {
      const res = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "user",
          isActive: true,
          access: 400,
        }),
      });
      console.log(res);

      if (res.ok) {
        window.open("login.html", "_self");
      } else {
        const errorData = await res.json();
        emailError.textContent = errorData.message || "Registration failed.";
        emailError.style.display = "block";
      }
    } catch (err) {
      emailError.textContent = "Error: " + err.message;
      emailError.style.display = "block";
    }
  });
