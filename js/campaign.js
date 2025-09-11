const campaignContainer = document.querySelector(".campaigns-container");
const search = document.querySelector(".search");

const getCampaigns = async () => {
  let res = await fetch("http://localhost:5000/campaigns");
  return await res.json();
};

const getPledges = async () => {
  let res = await fetch("http://localhost:5000/pledges");
  let data = await res.json();
  console.log(data);
};

const displayCampaigns = async (filter = "") => {
  const data = await getCampaigns();
  campaignContainer.innerHTML = "";
  data
    .filter((c) => c.title.toLowerCase().includes(filter.toLowerCase()))
    .forEach((campaign) => {
      const percent = Math.min((campaign.raised / campaign.goal) * 100, 100);
      const html = `
        <div class="campaign-card">
          <img src="${
            campaign.image || "../images/SparkFund Logo Design.png"
          }" alt="${campaign.title}" />
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
            <a href="#" class="btn">Support Now</a>
            <a href="#" data-id="${campaign.id}" class="btn view-btn">View</a>
          </div>
        </div>`;
      campaignContainer.insertAdjacentHTML("beforeend", html);
    });
};

const displayDetails = async (id) => {
  let res = await fetch(`http://localhost:5000/campaigns/${id}`);
  let data = await res.json();
  console.log(data);
};

displayCampaigns();
getPledges();

search.addEventListener("keyup", () => {
  displayCampaigns(search.value);
});

campaignContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("view-btn")) {
    e.preventDefault();
    const id = e.target.getAttribute("data-id");
    await displayDetails(id);
  }
});
