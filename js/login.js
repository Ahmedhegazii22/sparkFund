document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();

  const password = document.getElementById("loginPassword").value;

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  [emailError, passwordError].forEach((el) => (el.style.display = "none"));

  let hasError = false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    emailError.textContent = "Please enter a valid email.";
    emailError.style.display = "block";
    hasError = true;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;
  if (!passwordRegex.test(password)) {
    passwordError.textContent =
      "Password must be 8+ chars, contain upper, lower, number, and symbol.";
    passwordError.style.display = "block";
    hasError = true;
  }

  if (hasError) return;

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log(res);

    if (res.ok) {
      // Check if response is successful (status 200-299)
      const data = await res.json(); // Parse the JSON response

      if (data.accessToken) {
        // Store the token if needed
        localStorage.setItem("accessToken", data.accessToken);
        window.open("../index.html", "_self");
      } else {
        emailError.textContent = data.message || "Login failed.";
        emailError.style.display = "block";
      }
    } else {
      // Handle HTTP error responses
      const errorData = await res.json();
      emailError.textContent = errorData.message || "Login failed.";
      emailError.style.display = "block";
    }
  } catch (err) {
    emailError.textContent = "Error: " + err.message;
    emailError.style.display = "block";
  }
});
