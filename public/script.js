async function sendOTP() {
  let email = document.getElementById("email").value;

  let res = await fetch("/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  let data = await res.json();

  if (!data.ok) return alert(data.msg);

  document.getElementById("otpBox").style.display = "block";
}

async function verifyOTP() {
  let email = document.getElementById("email").value;
  let otp = document.getElementById("otp").value;

  let res = await fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp })
  });

  let data = await res.json();
  if (!data.ok) return alert(data.msg);

  window.location.href = data.zoom;
}

async function adminLogin() {
  let pass = document.getElementById("pass").value;

  let res = await fetch("/admin-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pass })
  });

  let data = await res.json();
  if (!data.ok) return alert("Wrong password");

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("panel").style.display = "block";
}

async function setZoom() {
  let link = document.getElementById("zoom").value;

  await fetch("/admin/set-zoom", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link })
  });

  alert("Zoom link updated!");
}

async function addEmail() {
  let email = document.getElementById("authEmail").value;

  await fetch("/admin/add-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  alert("Email added!");
}