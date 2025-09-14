// get campaign id from query string
const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");

const detailsContainer = document.getElementById("campaign-details");
const pledgeModal = document.getElementById("pledgeModal");
const closeBtn = document.querySelector(".modal-content .close");
const pledgeForm = document.getElementById("pledge-form");

const token = localStorage.getItem("accessToken");
const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

// fetch campaign by id
async function getCampaignById(id) {
  const res = await fetch(`http://localhost:5000/campaigns/${id}`);
  return await res.json();
}

// fetch pledges by campaignId
async function getPledgesByCampaign(id) {
  const res = await fetch(`http://localhost:5000/pledges?campaignId=${id}`);
  return await res.json();
}

// render campaign details
async function displayCampaign() {
  if (!campaignId) {
    detailsContainer.innerHTML = "<p>Campaign not found.</p>";
    return;
  }

  const campaign = await getCampaignById(campaignId);
  const pledges = await getPledgesByCampaign(campaignId);

  const totalRaised = pledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const goal = Number(campaign.goal) || 0;
  const percent = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

  const html = `
    <div class="campaign-header">
      <img src="${campaign.image}" alt="${campaign.title}" class="campaign-img"/>
      <div class="campaign-header-text">
        <h1>${campaign.title}</h1>
        <p>Deadline: ${campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "N/A"}</p>
      </div>
    </div>

    <section class="campaign-details">
      <div class="campaign-overview">
        <h2>Campaign Overview</h2>
        <p><strong>Category:</strong> ${campaign.category || "N/A"}</p>
        <p><strong>Goal:</strong> $${goal}</p>
        <p><strong>Raised:</strong> $${totalRaised}</p>
        <div class="progress-bar">
          <div class="progress" style="width:${percent}%"></div>
        </div>
        <div class="progress-text">${percent.toFixed(1)}%</div>
        <button class="btn support" id="supportBtn">Support This Campaign</button>
      </div>
    </section>
  `;
  detailsContainer.innerHTML = html;

  document.getElementById("supportBtn").addEventListener("click", () => {
    if (!token || !user) {
      alert("You need to login to support a campaign.");
      window.location.href = "../pages/login.html";
      return;
    }

    if (campaign.creatorId == user.id) {
      alert("You cannot support your own campaign.");
      return;
    }

    pledgeModal.style.display = "block";
  });
}

closeBtn.addEventListener("click", () => {
  pledgeModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === pledgeModal) {
    pledgeModal.style.display = "none";
  }
});

pledgeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(pledgeForm);
  const amount = Number(formData.get("amount"));

  const pledge = {
    amount,
    fullname: formData.get("fullname"),
    cardnumber: formData.get("cardnumber"),
    expiry: formData.get("expiry"),
    cvv: formData.get("cvv"),
    campaignId: campaignId,
    userId: user.id
  };

  try {
    await fetch("http://localhost:5000/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pledge),
    });

    alert("Thank you for supporting this campaign!");
    pledgeModal.style.display = "none";
    pledgeForm.reset();
    displayCampaign();
  } catch (err) {
    console.error("Error submitting pledge:", err);
    alert("Error submitting pledge. Please try again.");
  }
});

displayCampaign();
