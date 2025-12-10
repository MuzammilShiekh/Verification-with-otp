import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import fs from "fs";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

const load = () =>
  JSON.parse(fs.readFileSync("data.json", "utf8"));

const save = (data) =>
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS
  }
});

// Admin password (encrypted)
const ADMIN_PASS = bcrypt.hashSync(process.env.ADMIN_PASS, 10);

// ---------------------------
// Generate OTP
// ---------------------------
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const db = load();

  if (!db.authorizedEmails.includes(email)) {
    return res.json({ ok: false, msg: "Email not authorized" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  db.otp[email] = otp;
  save(db);

  await transporter.sendMail({
    from: `Zoom Access <${process.env.EMAIL}>`,
    to: email,
    subject: "Your OTP Code",
    html: `<h2>Your OTP:</h2><h1>${otp}</h1>`
  });

  res.json({ ok: true });
});

// ---------------------------
// Verify OTP → Send Zoom Link
// ---------------------------
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const db = load();

  if (db.used[email]) {
    return res.json({ ok: false, msg: "OTP already used" });
  }

  if (db.otp[email] !== otp) {
    return res.json({ ok: false, msg: "Invalid OTP" });
  }

  db.used[email] = true;
  save(db);

  res.json({ ok: true, zoom: db.zoomLink });
});

// ---------------------------
// ADMIN: login
// ---------------------------
app.post("/admin-login", (req, res) => {
  const { pass } = req.body;

  if (!bcrypt.compareSync(pass, ADMIN_PASS)) {
    return res.json({ ok: false });
  }
  res.json({ ok: true });
});

// ---------------------------
// ADMIN: Set zoom link
// ---------------------------
app.post("/admin/set-zoom", (req, res) => {
  const { link } = req.body;
  const db = load();
  db.zoomLink = link;
  db.used = {}; // reset usage
  db.otp = {}; // clear otp
  save(db);
  res.json({ ok: true });
});

// ---------------------------
// ADMIN: Add authorized email
// ---------------------------
app.post("/admin/add-email", (req, res) => {
  const { email } = req.body;
  const db = load();
  if (!db.authorizedEmails.includes(email)) {
    db.authorizedEmails.push(email);
    save(db);
  }
  res.json({ ok: true });
});

// ---------------------------
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});