const navToken = localStorage.getItem("accessToken") || null;
const user = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const navBar = document.getElementById("navBar");

// نحدد اللينكات الإضافية
let extraLinks = "";
if (navToken) {
  extraLinks += `<a href="../pages/dashboard.html">Dashboard</a>`;
  if (user && user.role === "admin") {
    extraLinks += `<a href="../pages/admin.html">Admin Panel</a>`;
  }
}

navBar.innerHTML = `
  <header class="navbar">
    <div class="logo">
      <img src="../images/SparkFund Logo Design.png" alt="SparkFund Logo" />
    </div>
    <i class="fas fa-bars hamburger" onclick="toggleNav()"></i>
    <nav class="nav-links">
      <a href="../index.html">Home</a>
      <a href="../pages/campaign.html">Browse Campaigns</a>
      <a href="../pages/create.html">Start Campaign</a>
      ${extraLinks}
    </nav>
    <div class="auth-buttons">
      ${
        navToken
          ? `<div>
              <a href="#" class="btn Logout" onclick="logout()">Logout</a>
            </div>`
          : `<div>
              <a href="../pages/login.html" class="btn login">Login</a>
              <a href="../pages/register.html" class="btn register">Register</a>
            </div>`
      }
    </div>
  </header>
`;

// Add logout function
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("user");
  window.location.href = "../pages/login.html";
}
