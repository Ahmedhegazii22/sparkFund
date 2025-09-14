// admin-dashboard.js (or wherever your admin script is)
const token = localStorage.getItem("accessToken");

const tabButtons = document.querySelectorAll(".tab");
const tabContent = document.getElementById("tab-content");

const getUsers = async () => {
  const res = await fetch("http://localhost:5000/users", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return await res.json();
};

const getCampaigns = async () => {
  const res = await fetch("http://localhost:5000/campaigns", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return await res.json();
};

const getPledges = async () => {
  const res = await fetch("http://localhost:5000/pledges", {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return await res.json();
};

// Render users: نضيف data-active للزر عشان نعرف الحالة الحالية
const renderUsers = (users) => {
  let html = `<h2>Users</h2><table>
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>`;
  users.forEach((u) => {
    html += `
      <tr>
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.isActive ? "Active" : "Banned"}</td>
        <td>
          <button class="action ban" data-id="${u.id}" data-active="${u.isActive}">
            ${u.isActive ? "Ban" : "Unban"}
          </button>
        </td>
      </tr>`;
  });
  html += `</table>`;
  tabContent.innerHTML = html;
};

const renderCampaigns = (campaigns) => {
  let html = `<h2>Campaigns</h2><table>
    <tr><th>ID</th><th>Title</th><th>Goal</th><th>Approved</th><th>Actions</th></tr>`;
  campaigns.forEach((c) => {
    html += `
      <tr>
        <td>${c.id}</td>
        <td>${c.title}</td>
        <td>$${c.goal}</td>
        <td>${c.isApproved ? "✅" : "❌"}</td>
        <td>
          <button class="action approve" data-id="${c.id}">Approve</button>
          <button class="action reject" data-id="${c.id}">Reject</button>
          <button class="action delete" data-id="${c.id}">Delete</button>
        </td>
      </tr>`;
  });
  html += `</table>`;
  tabContent.innerHTML = html;
};

const renderPledges = (pledges) => {
  let html = `<h2>Pledges</h2><table>
    <tr><th>ID</th><th>Campaign ID</th><th>User</th><th>Amount</th></tr>`;
  pledges.forEach((p) => {
    html += `
      <tr>
        <td>${p.id}</td>
        <td>${p.campaignId}</td>
        <td>${p.fullname || "Anonymous"}</td>
        <td>$${p.amount}</td>
      </tr>`;
  });
  html += `</table>`;
  tabContent.innerHTML = html;
};

// Tab clicks
tabButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    const tab = btn.dataset.tab;

    if (tab === "users") {
      const users = await getUsers();
      renderUsers(users);
    }

    if (tab === "campaigns") {
      const campaigns = await getCampaigns();
      renderCampaigns(campaigns);
    }

    if (tab === "pledges") {
      const pledges = await getPledges();
      renderPledges(pledges);
    }
  });
});

// Event delegation للأزرار: نستخدم closest() عشان نتأكد ناخد الزر لو المستخدم ضغط على عنصر فرعي
tabContent.addEventListener("click", async (e) => {
  // BAN / UNBAN
  const banBtn = e.target.closest("button.action.ban");
  if (banBtn) {
    const id = banBtn.dataset.id;
    // dataset.active == "true" أو "false"
    const currentActive = banBtn.dataset.active === "true";
    const newActive = !currentActive;

    // تعطيل الزر أثناء الطلب (UX)
    banBtn.disabled = true;
    banBtn.textContent = newActive ? "Unban..." : "Ban...";

    try {
      const res = await fetch(`http://localhost:5000/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isActive: newActive }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to update user");
      }

      // إعادة تحميل قائمة اليوزرز بعد التحديث
      const users = await getUsers();
      renderUsers(users);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تعديل حالة المستخدم.");
      // نقدر نعيد الحالة القديمة على الزر لو احتجت
    } finally {
      // لو ما عملناش re-render (في حالات فشل) نعيد تفعيل الزر
      banBtn.disabled = false;
    }
    return;
  }

  // APPROVE / REJECT / DELETE لأحد الكامبينز
  const actionBtn = e.target.closest("button.action.approve, button.action.reject, button.action.delete");
  if (actionBtn) {
    const id = actionBtn.dataset.id;

    if (actionBtn.classList.contains("approve")) {
      await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isApproved: true }),
      });
      const campaigns = await getCampaigns();
      renderCampaigns(campaigns);
      return;
    }

    if (actionBtn.classList.contains("reject")) {
      await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isApproved: false }),
      });
      const campaigns = await getCampaigns();
      renderCampaigns(campaigns);
      return;
    }

    if (actionBtn.classList.contains("delete")) {
      if (!confirm("Are you sure you want to delete this campaign?")) return;
      await fetch(`http://localhost:5000/campaigns/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const campaigns = await getCampaigns();
      renderCampaigns(campaigns);
      return;
    }
  }
});
