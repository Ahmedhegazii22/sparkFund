document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Complete All Fields");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      alert("Login successful!");

      localStorage.setItem("user", JSON.stringify(data));

      window.open("http://127.0.0.1:5500/index.html", "_self");
    } else {
      const errorData = await res.json();
      alert("Login failed: " + errorData.message);
    }
  } catch (err) {
    alert("Error: " + err.message);
  }
});
