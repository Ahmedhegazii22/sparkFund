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

async function getUserCampaigns() {
  try {
    const res = await fetch(
      `http://localhost:5000/campaigns?creatorId=${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    notice.textContent = "Error loading campaigns.";
    return [];
  }
}

async function getAllPledges() {
  try {
    const res = await fetch(`http://localhost:5000/pledges`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

async function displayCampaigns() {
  const campaigns = await getUserCampaigns();
  const allPledges = await getAllPledges();
  userCampaignsContainer.innerHTML = "";
  if (!campaigns || campaigns.length === 0) {
    notice.textContent = "You have no campaigns yet.";
    return;
  }
  notice.textContent = "";
  campaigns.forEach((c) => {
    const status = c.isApproved ? "Approved" : "Pending";
    const card = document.createElement("div");
    card.classList.add("campaign-card");
    card.innerHTML = `
      <img src="${c.image}" alt="${c.title}" class="campaign-img"/>
      <h3>${c.title}</h3>
      <p>Goal: $${c.goal} </p>
      <p>Deadline: ${
        c.deadline ? new Date(c.deadline).toLocaleDateString() : "N/A"
      }</p>
      <p>Status: <strong>${status}</strong></p>
      <div>
        <button class="edit-btn" data-id="${c.id}">Edit</button>
        <button class="delete-btn" data-id="${c.id}">Delete</button>
        <button class="view-pledges-btn" data-id="${c.id}">View Pledges</button>
      </div>
    `;
    userCampaignsContainer.appendChild(card);
  });
}

async function displayPledges(campaignId) {
  pledgeList.innerHTML = "";
  const allPledges = await getAllPledges();
  const pledges = campaignId
    ? allPledges.filter((p) => p.campaignId === campaignId)
    : allPledges.filter((p) => p.userId === userId || p.campaignId);
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
  userPledgesSection.style.display = "block";
}

togglePledgesBtn.addEventListener("click", async () => {
  if (
    userPledgesSection.style.display === "none" ||
    userPledgesSection.style.display === ""
  ) {
    await displayPledges(null);
    togglePledgesBtn.textContent = "Hide All Pledges";
  } else {
    userPledgesSection.style.display = "none";
    togglePledgesBtn.textContent = "View All Pledges";
  }
});

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
  if (e.target.classList.contains("view-pledges-btn")) {
    await displayPledges(id);
  }
});

function closeModal() {
  editModal.style.display = "none";
}
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
  if (e.target === editModal) closeModal();
});

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

displayCampaigns();
