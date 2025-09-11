const token = localStorage.getItem("accessToken") || null;
const navBar = document.getElementById('navBar');

navBar.innerHTML = `
  <header class="navbar">
    <div class="logo">
      <img src="../images/SparkFund Logo Design.png" alt="SparkFund Logo" />
    </div>
    <i class="fas fa-bars hamburger" onclick="toggleNav()"></i>
    <nav class="nav-links">
      <a href="../index.html">Home</a>
      <a href="campaign.html">Browse Campaigns</a>
      <a href="create.html">Start Campaign</a>
    </nav>
    <div class="auth-buttons">
      ${token ? 
        `<div>
          <a href="#" class="btn Logout" onclick="logout()">
            Logout
          </a>
        </div>` 
        : 
        `<div>
          <a href="../pages/login.html" class="btn login">
            Login
          </a>
          <a href="../pages/register.html   " class="btn register">
            Register
          </a>
        </div>`
      }
    </div>
  </header>
`;

// Add logout function
function logout() {
  localStorage.removeItem("accessToken");
  window.location.href = "login.html";
}