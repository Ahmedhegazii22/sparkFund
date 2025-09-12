// get campaign id from query string
const params = new URLSearchParams(window.location.search);
const campaignId = params.get("id");

const detailsContainer = document.getElementById("campaign-details");
const pledgeModal = document.getElementById("pledgeModal");
const closeBtn = document.querySelector(".modal-content .close");
const pledgeForm = document.getElementById("pledge-form");

// fetch campaign by id
async function getCampaignById(id) {
  const res = await fetch(`http://localhost:5000/campaigns/${id}`);
  return await res.json();
}

// render campaign details
async function displayCampaign() {
  if (!campaignId) {
    detailsContainer.innerHTML = "<p>Campaign not found.</p>";
    return;
  }

  const campaign = await getCampaignById(campaignId);
  const percent = Math.min((campaign.raised / campaign.goal) * 100, 100);

  const html = `
    <div class="campaign-header">
      <h1>${campaign.title}</h1>
      <p>Deadline: ${
        campaign.deadline
          ? new Date(campaign.deadline).toLocaleDateString()
          : "N/A"
      }</p>
    </div>

    <section class="campaign-details">
      <div class="campaign-overview">
        <h2>Campaign Overview</h2>
        <p><strong>Category:</strong> ${campaign.category || "N/A"}</p>
        <p><strong>Goal:</strong> $${campaign.goal}</p>
        <p><strong>Raised:</strong> $${campaign.raised}</p>
        <div class="progress-bar">
          <div class="progress" style="width:${percent}%"></div>
        </div>
        <button class="btn support" id="supportBtn">Support This Campaign</button>
      </div>
    </section>
  `;
  detailsContainer.innerHTML = html;

  // open modal
  document.getElementById("supportBtn").addEventListener("click", () => {
    pledgeModal.style.display = "block";
  });
}

// close modal
closeBtn.addEventListener("click", () => {
  pledgeModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === pledgeModal) {
    pledgeModal.style.display = "none";
  }
});

// handle form submit
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
  };

  try {
    // 1. send pledge to server
    await fetch("http://localhost:5000/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pledge),
    });

    // 2. update campaign raised
    const campaign = await getCampaignById(campaignId);
    const updatedRaised = Number(campaign.raised) + amount;

    await fetch(`http://localhost:5000/campaigns/${campaignId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raised: updatedRaised }),
    });

    alert("Thank you for supporting this campaign!");

    // close modal and reset form
    pledgeModal.style.display = "none";
    pledgeForm.reset();

    // 3. re-render campaign details
    displayCampaign();
  } catch (err) {
    console.error("Error submitting pledge:", err);
    alert("Error submitting pledge. Please try again.");
  }
});

displayCampaign();
