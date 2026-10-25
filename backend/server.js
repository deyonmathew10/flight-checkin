const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-for-college-demo";
const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

app.use(cors({ origin: true }));
app.use(express.json());

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, username: user.username },
    JWT_SECRET,
    { expiresIn: "8h" }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Please log in again." });
  }
}

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "SkyCheck Auth Backend" }));

app.post("/api/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    if (!name || username.length < 3 || password.length < 4) {
      return res.status(400).json({ message: "Enter a name, username (at least 3 characters), and password (at least 4 characters)." });
    }
    const users = readUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return res.status(409).json({ message: "That username already exists." });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name,
      username,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    saveUsers(users);
    return res.status(201).json({ message: "Account created. Please log in." });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Could not create account." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const password = String(req.body.password || "");
    const user = readUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Incorrect username or password." });
    }
    return res.json({
      message: "Login successful.",
      token: createToken(user),
      user: { name: user.name, username: user.username }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Could not log in." });
  }
});

app.get("/api/me", authRequired, (req, res) => {
  res.json({ user: { name: req.user.name, username: req.user.username } });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`SkyCheck auth backend running on port ${PORT}`);
});
