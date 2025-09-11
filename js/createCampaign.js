// ==================== Preview Updates ====================
const form = document.getElementById("campaign-form");
const previewImage = document.querySelector(".preview-image");
const previewTitle = document.getElementById("preview-title");
const previewDeadline = document.getElementById("preview-deadline");

form.addEventListener("input", function (e) {
  if (e.target.name === "title") {
    previewTitle.textContent = e.target.value || "Campaign Title";
  }

  if (e.target.name === "deadline") {
    previewDeadline.textContent = e.target.value
      ? `Deadline: ${new Date(e.target.value).toLocaleDateString()}`
      : "";
  }

  if (e.target.name === "image") {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        previewImage.style.backgroundImage = `url(${event.target.result})`;
        previewImage.style.backgroundSize = "cover";
      };
      reader.readAsDataURL(file);
    }
  }
});

// ==================== Convert File to Base64 ====================
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// ==================== Form Submission ====================
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const title = formData.get("title");
  const goal = formData.get("goal");
  const deadline = formData.get("deadline");
  const imageFile = formData.get("image");

  let imageBase64 = null;
  if (imageFile && imageFile.size > 0) {
    imageBase64 = await fileToBase64(imageFile);
  }

  const payload = {
    title,
    goal: Number(goal),
    deadline,
    image: imageBase64,
  };

  try {
    const res = await fetch("http://localhost:5000/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to create campaign");

    alert("Campaign submitted successfully!");
    form.reset();
    previewImage.style.backgroundImage = "";
    previewTitle.textContent = "";
    previewDeadline.textContent = "";
  } catch (err) {
    console.error(err);
    alert("Error submitting campaign.");
  }
});
