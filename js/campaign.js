const campaignContainer = document.querySelector(".campaigns-container");
const searchInput = document.querySelector(".search");
const categoryFilter = document.getElementById("categoryFilter");

const getCampaigns = async (category = "") => {
  let url = "http://localhost:5000/campaigns?isApproved=true&_sort=deadline";

  if (category) {
    url += `&category=${category}`;
  }

  const res = await fetch(url);
  return await res.json();
};

const getCampaignById = async (id) => {
  const res = await fetch(`http://localhost:5000/campaigns/${id}`);
  return await res.json();
};

const displayCampaigns = async () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;

  const campaigns = await getCampaigns(category);

  const filtered = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchValue)
  );

  campaignContainer.innerHTML = "";

  if (filtered.length === 0) {
    campaignContainer.innerHTML = "<p>No campaigns found.</p>";
    return;
  }

  filtered.forEach((campaign) => {
    const percent = Math.min((campaign.raised / campaign.goal) * 100, 100);

    const html = `
      <div class="campaign-card">
        <img src="${campaign.image}" alt="${campaign.title}" />
        <h3>${campaign.title}</h3>
        <p>Creator: ${campaign.creator}<br/><br/>Goal: $${
      campaign.goal
    } | Raised: $${campaign.raised}</p>
        <p>Deadline: ${
          campaign.deadline
            ? new Date(campaign.deadline).toLocaleDateString()
            : "N/A"
        }</p>
        <div class="progress-bar"><div class="progress" style="width: ${percent}%"></div></div>
        <div class="btns">
          <a href="#" data-id="${campaign.id}" class="btn">Support Now</a>
        </div>
      </div>`;
    campaignContainer.insertAdjacentHTML("beforeend", html);
  });
};

searchInput.addEventListener("input", displayCampaigns);
categoryFilter.addEventListener("change", displayCampaigns);

campaignContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn")) {
    e.preventDefault();
    const id = e.target.getAttribute("data-id");
    if (id) {
      const campaign = await getCampaignById(id);
      window.location.href = `details.html?id=${id}`;
    }
  }
});

displayCampaigns();
