// assumed logged-in admin
const userList = document.getElementById("userList");
const campaignList = document.getElementById("campaignList");
const pledgeList = document.getElementById("pledgeList");

// Tabs
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// Fetch and display users
async function fetchUsers() {
  const res = await fetch("http://localhost:5000/users");
  const users = await res.json();
  userList.innerHTML = "";
  users.forEach(u => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${u.name}</h3>
      <p>Email: ${u.email}</p>
      <p>Status: ${u.isActive ? "Active" : "Banned"}</p>
      <button class="ban-btn" data-id="${u.id}">${u.isActive ? "Ban" : "Unban"}</button>
    `;
    userList.appendChild(card);
  });
}

// Fetch and display campaigns
async function fetchCampaigns() {
  const res = await fetch("http://localhost:5000/campaigns");
  const campaigns = await res.json();
  campaignList.innerHTML = "";
  campaigns.forEach(c => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${c.image || 'https://via.placeholder.com/300x150'}" alt="${c.title}" />
      <h3>${c.title}</h3>
      <p>Goal: $${c.goal} | Raised: $${c.raised || 0}</p>
      <p>Creator: ${c.creator}</p>
      <p>Status: ${c.isApproved ? "Approved" : "Pending"}</p>
      <button class="approve-btn" data-id="${c.id}">Approve</button>
      <button class="reject-btn" data-id="${c.id}">Reject</button>
      <button class="delete-btn" data-id="${c.id}">Delete</button>
    `;
    campaignList.appendChild(card);
  });
}

// Fetch and display pledges
async function fetchPledges() {
  const res = await fetch("http://localhost:5000/pledges");
  const pledges = await res.json();
  pledgeList.innerHTML = "";
  pledges.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <p>User: ${p.fullname}</p>
      <p>Campaign ID: ${p.campaignId}</p>
      <p>Amount: $${p.amount}</p>
    `;
    pledgeList.appendChild(card);
  });
}

// Event delegation
document.addEventListener("click", async e => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("ban-btn")) {
    const res = await fetch(`http://localhost:5000/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: e.target.textContent === "Unban" })
    });
    fetchUsers();
  }

  if (e.target.classList.contains("approve-btn")) {
    await fetch(`http://localhost:5000/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true })
    });
    fetchCampaigns();
  }

  if (e.target.classList.contains("reject-btn")) {
    await fetch(`http://localhost:5000/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: false })
    });
    fetchCampaigns();
  }

  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Delete this campaign?")) {
      await fetch(`http://localhost:5000/campaigns/${id}`, { method: "DELETE" });
      fetchCampaigns();
    }
  }
});

// Initial load
fetchUsers();
fetchCampaigns();
fetchPledges();
