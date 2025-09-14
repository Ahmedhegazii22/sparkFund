document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // reset errors
  [emailError, passwordError].forEach((el) => {
    el.style.display = "none";
    el.textContent = "";
  });

  let hasError = false;

  if (hasError) return;

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      emailError.textContent = errorData.message || "Login failed.";
      emailError.style.display = "block";
      return;
    }

    const data = await res.json();

    if (data.accessToken && data.user) {
      // check if banned
      if (data.user.isActive === false) {
        emailError.textContent = "Your account has been banned.";
        emailError.style.display = "block";
        return;
      }

      // save to localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // redirect based on role
      if (data.user.role === "admin") {
        window.location.href = "../pages/admin.html";
      } else {
        window.location.href = "../pages/campaign.html";
      }
    } else {
      emailError.textContent = data.message || "Login failed.";
      emailError.style.display = "block";
    }
  } catch (err) {
    emailError.textContent = "Error: " + err.message;
    emailError.style.display = "block";
  }
});
