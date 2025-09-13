const campaignContainer = document.querySelector(".campaigns-container");
const searchInput = document.querySelector(".search");
const categoryFilter = document.getElementById("categoryFilter");

const getCampaigns = async (category = "") => {
  let url = "http://localhost:5000/campaigns?isApproved=true&_sort=deadline";
  if (category) url += `&category=${category}`;
  const res = await fetch(url);
  return await res.json();
};

const getPledgesByCampaignId = async (id) => {
  const res = await fetch(`http://localhost:5000/pledges?campaignId=${id}`);
  return await res.json();
};

const displayCampaigns = async () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const campaigns = await getCampaigns(category);
  const filtered = campaigns.filter(c =>
    c.title.toLowerCase().includes(searchValue)
  );

  campaignContainer.innerHTML = "";

  if (filtered.length === 0) {
    campaignContainer.innerHTML = "<p>No campaigns found.</p>";
    return;
  }

  for (const campaign of filtered) {
    const goal = Number(campaign.goal) || 0;

    const pledges = await getPledgesByCampaignId(campaign.id);
    const totalRaised = pledges.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const percent = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

    const html = `
      <div class="campaign-card">
        <img src="${campaign.image }" alt="${campaign.title}" />
        <h3>${campaign.title}</h3>
        <p>Goal: $${goal} <br> Raised: $${totalRaised}</p>
        <p>Deadline: ${campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : "N/A"}</p>

        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress" style="width: ${percent}%"></div>
          </div>
          <div class="progress-text">${percent.toFixed(1)}%</div>
          <div class="pledges-count">Pledges: ${pledges.length}</div>
        </div>

        <div class="btns">
          <a href="details.html?id=${campaign.id}" class="btn">Support Now</a>
        </div>
      </div>
    `;

    campaignContainer.insertAdjacentHTML("beforeend", html);
  }
};

searchInput.addEventListener("input", displayCampaigns);
categoryFilter.addEventListener("change", displayCampaigns);

displayCampaigns();
