document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  const emailError = document.getElementById("emailError");
  const passwordError = document.getElementById("passwordError");

  // إخفاء أي رسائل خطأ قديمة
  [emailError, passwordError].forEach((el) => (el.style.display = "none"));

  let hasError = false;

  // التحقق من الإيميل
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    emailError.textContent = "Please enter a valid email.";
    emailError.style.display = "block";
    hasError = true;
  }

  // التحقق من الباسورد
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&]).{8,}$/;
  if (!passwordRegex.test(password)) {
    passwordError.textContent =
      "Password must be 8+ chars, contain upper, lower, number, and symbol.";
    passwordError.style.display = "block";
    hasError = true;
  }

  if (hasError) return;

  try {
    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();

      // لازم السيرفر يرجع user object مع الـtoken
      if (data.accessToken && data.user) {
        // تخزين الـtoken + userId
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", data.user.id);

        // إعادة التوجيه للصفحة الرئيسية
        window.open("../index.html", "_self");
      } else {
        emailError.textContent = data.message || "Login failed.";
        emailError.style.display = "block";
      }
    } else {
      const errorData = await res.json();
      emailError.textContent = errorData.message || "Login failed.";
      emailError.style.display = "block";
    }
  } catch (err) {
    emailError.textContent = "Error: " + err.message;
    emailError.style.display = "block";
  }
});
