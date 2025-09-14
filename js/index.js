const campaignContainer = document.querySelector(".campaigns-container");

const getCampaigns = async () => {
  const url = "http://localhost:5000/campaigns?isApproved=true&_sort=deadline";
  const res = await fetch(url);
  return await res.json();
};

const displayCampaigns = async () => {
  const campaigns = await getCampaigns();

  const limited = campaigns.slice(0, 3);

  campaignContainer.innerHTML = "";

  if (limited.length === 0) {
    campaignContainer.innerHTML = "<p>No campaigns found.</p>";
    return;
  }

  for (const campaign of limited) {
    const goal = Number(campaign.goal) || 0;

    const html = `
      <div class="campaign-card">
        <img src="${campaign.image}" alt="${campaign.title}" />
        <h3>${campaign.title}</h3>
        <p>Goal: $${goal}</p>
        <p>Deadline: ${
          campaign.deadline
            ? new Date(campaign.deadline).toLocaleDateString()
            : "N/A"
        }</p>

        <div class="btns">
          <a href="pages/details.html?id=${
            campaign.id
          }" class="btn">Support Now</a>
        </div>
      </div>
    `;

    campaignContainer.insertAdjacentHTML("beforeend", html);
  }
};

displayCampaigns();
