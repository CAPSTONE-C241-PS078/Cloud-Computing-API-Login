const express = require("express");
const bcrypt = require("bcryptjs");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

// Inisialisasi Firestore
const firestore = admin.firestore();

// Contoh pengiriman email untuk forgot password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Route untuk registrasi
router.post("/register", async (req, res) => {
  const { Email, Password, FullName } = req.body;

  if (!Email || !Password || !FullName) {
    return res
      .status(400)
      .json({ message: "Email, password, and full name are required" });
  }

  try {
    // Check if user already exists
    const userSnapshot = await firestore
      .collection("users")
      .where("Email", "==", Email)
      .get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Insert the new user into the database
    await firestore.collection("users").doc().set({
      Email: Email,
      Password: hashedPassword,
      FullName: FullName,
    });

    res.status(201).json({ message: "User Registered" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Route untuk login
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const userSnapshot = await firestore
      .collection("users")
      .where("Email", "==", Email)
      .get();
    if (userSnapshot.empty) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const userData = userSnapshot.docs[0].data();
    const isPasswordValid = await bcrypt.compare(Password, userData.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "User Login!" });
  } catch (error) {
    res.status(500).json({ message: "Error logging in user" });
  }
});

// Route untuk menghasilkan token reset
function generateResetToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        const token = buf.toString("hex");
        resolve(token);
      }
    });
  });
}

// Route untuk forgot password
router.post("/forgot-password", async (req, res) => {
  const { Email } = req.body;

  try {
    const userSnapshot = await firestore
      .collection("users")
      .where("Email", "==", Email)
      .get();
    if (userSnapshot.empty) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = crypto.randomBytes(20).toString("hex");

    const userId = userSnapshot.docs[0].id;
    await firestore
      .collection("users")
      .doc(userId)
      .update({
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000, // 1 jam
      });

    const mailOptions = {
      to: Email,
      from: process.env.EMAIL,
      subject: "Password Reset",
      text:
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
        `http://${req.headers.host}/reset-password/${token}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("Error sending email:", err);
        res.status(500).json({ message: "Error sending the email" });
      } else {
        res.status(200).json({ message: "Recovery email sent" });
      }
    });
  } catch (error) {
    console.error("Error processing forgot-password:", error);
    res.status(500).json({ message: "Error processing request" });
  }
});

// Route untuk reset password dengan token
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { Password } = req.body;

  try {
    const userSnapshot = await firestore
      .collection("users")
      .where("resetPasswordToken", "==", token)
      .where("resetPasswordExpires", ">", Date.now())
      .get();

    if (userSnapshot.empty) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const userId = userSnapshot.docs[0].id;
    const hashedPassword = await bcrypt.hash(Password, 10);

    await firestore.collection("users").doc(userId).update({
      Password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
});

module.exports = router;
