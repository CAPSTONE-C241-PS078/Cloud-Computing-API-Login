const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const admin = require("firebase-admin");

dotenv.config();

// Inisialisasi aplikasi Firebase
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL:
    "https://console.firebase.google.com/project/cloudengine-project/firestore",
});

const authRoutes = require("./routes/auth");

const app = express();

app.use(bodyParser.json());

// Menambahkan rute auth
app.use("", authRoutes);

// Penanganan untuk rute root
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the authentication API!" });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
