const token = localStorage.getItem("accessToken");
const userId = localStorage.getItem("userId");

const userCampaignsContainer = document.getElementById("userCampaigns");
const notice = document.getElementById("notice");
const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const editForm = document.getElementById("editForm");

const togglePledgesBtn = document.getElementById("togglePledgesBtn");
const userPledgesSection = document.getElementById("userPledges");
const pledgeList = document.getElementById("pledgeList");

let editingCampaignId = null;

// Fetch campaigns by user
async function getUserCampaigns() {
  try {
    const res = await fetch(
      `http://localhost:5000/campaigns?creatorId=${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch campaigns");
    return await res.json();
  } catch (err) {
    notice.textContent = "Error loading campaigns.";
    console.error(err);
    return [];
  }
}

// Fetch pledges by user
async function getUserPledges() {
  try {
    const res = await fetch(`http://localhost:5000/pledges?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch pledges");
    return await res.json();
  } catch (err) {
    pledgeList.innerHTML = "<p>Error loading pledges.</p>";
    console.error(err);
    return [];
  }
}

// Display campaigns
async function displayCampaigns() {
  const campaigns = await getUserCampaigns();
  userCampaignsContainer.innerHTML = "";

  if (!campaigns || campaigns.length === 0) {
    notice.textContent = "You have no campaigns yet.";
    return;
  } else {
    notice.textContent = "";
  }

  campaigns.forEach((c) => {
    const card = document.createElement("div");
    card.classList.add("campaign-card");
    card.innerHTML = `
      <img src="${c.image || "https://via.placeholder.com/300x150"}" alt="${
      c.title
    }" class="campaign-img"/>
      <h3>${c.title}</h3>
      <p>Goal: $${c.goal} | Raised: $${c.raised || 0}</p>
      <p>Deadline: ${
        c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"
      }</p>
      <div>
        <button class="edit-btn" data-id="${c.id}">Edit</button>
        <button class="delete-btn" data-id="${c.id}">Delete</button>
      </div>
    `;
    userCampaignsContainer.appendChild(card);
  });
}

// Display pledges
async function displayPledges() {
  const pledges = await getUserPledges();
  pledgeList.innerHTML = "";

  if (!pledges || pledges.length === 0) {
    pledgeList.innerHTML = "<p>No pledges yet.</p>";
    return;
  }

  pledges.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("pledge-card");
    div.innerHTML = `
      <p><strong>Campaign ID:</strong> ${p.campaignId}</p>
      <p><strong>Supporter:</strong> ${p.fullname}</p>
      <p><strong>Amount:</strong> $${p.amount}</p>
    `;
    pledgeList.appendChild(div);
  });

  togglePledgesBtn.textContent = `Hide Your Pledges (${pledges.length})`;
}

togglePledgesBtn.addEventListener("click", async () => {
  if (userPledgesSection.style.display === "none") {
    await displayPledges();
    userPledgesSection.style.display = "block";
  } else {
    userPledgesSection.style.display = "none";
    togglePledgesBtn.textContent = "View Your Pledges";
  }
});

// Edit / Delete logic
userCampaignsContainer.addEventListener("click", async (e) => {
  const id = e.target.getAttribute("data-id");

  if (e.target.classList.contains("edit-btn")) {
    editingCampaignId = id;
    const res = await fetch(`http://localhost:5000/campaigns/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const campaign = await res.json();

    editForm.title.value = campaign.title;
    editForm.goal.value = campaign.goal;
    editForm.deadline.value = campaign.deadline
      ? new Date(campaign.deadline).toISOString().split("T")[0]
      : "";

    editModal.style.display = "flex";
  }

  if (e.target.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this campaign?")) {
      await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      displayCampaigns();
    }
  }
});

// Modal handlers
function closeModal() {
  editModal.style.display = "none";
}
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === editModal) closeModal();
});

// Submit edit form
editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingCampaignId) return;

  const payload = {
    title: editForm.title.value,
    goal: Number(editForm.goal.value),
    deadline: editForm.deadline.value || null,
  };

  await fetch(`http://localhost:5000/campaigns/${editingCampaignId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  closeModal();
  displayCampaigns();
});

// Initial render
displayCampaigns();
