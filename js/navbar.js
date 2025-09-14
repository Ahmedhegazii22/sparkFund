const navToken = localStorage.getItem("accessToken") || null;
const navUser = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;
const navBar = document.getElementById("navBar");

let extraLinks = "";
if (navToken) {
  extraLinks += `<a href="../pages/dashboard.html">Dashboard</a>`;
  if (navUser && navUser.role === "admin") {
    extraLinks += `<a href="../pages/admin.html">Admin Panel</a>`;
  }
}

const currentPage = window.location.pathname.split("/").pop();

let authButtons = "";
if (navToken) {
  authButtons = `<a href="#" class="btn Logout" onclick="logout()">Logout</a>`;
} else {
  if (currentPage === "login.html") {
    authButtons = `<a href="../pages/register.html" class="btn register">Register</a>`;
  } else if (currentPage === "register.html") {
    authButtons = `<a href="../pages/login.html" class="btn login">Login</a>`;
  } else {
    authButtons = `
      <a href="../pages/login.html" class="btn login">Login</a>
      <a href="../pages/register.html" class="btn register">Register</a>
    `;
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
      ${authButtons}
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
