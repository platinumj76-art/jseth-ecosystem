npm install
node server.js
// server.js — J‑Seth Productions / GENIUS Ecosystem
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use(cookieParser());

// DB (in-memory for demo; replace ':memory:' with 'ecosystem.db' for persistence)
const db = new Database(":memory:");
db.exec(`
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT, title TEXT, data TEXT,
  ip_owner TEXT, royalty_rate REAL, created_at TEXT
);
CREATE TABLE IF NOT EXISTS consent_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jurisdiction TEXT, consent_given INTEGER, created_at TEXT
);
CREATE TABLE IF NOT EXISTS roi_schedule (
  year INTEGER, roi_percent REAL
);
`);
[
  {y:1,p:10},{y:2,p:20},{y:3,p:30},
  {y:4,p:15},{y:5,p:15},{y:6,p:15},
  {y:7,p:15},{y:8,p:15},{y:9,p:15},{y:10,p:15}
].forEach(r => db.prepare("INSERT INTO roi_schedule VALUES (?,?)").run(r.y,r.p));

// Routes
app.get("/", (req,res)=>res.send(`
  <h1>J‑Seth Productions</h1>
  <p>Building the Creative Economy Engine — powered by GENIUS</p>
  <ul>
    <li><a href="/dashboard">Investor Dashboard</a></li>
    <li><a href="/consent">Cookie Consent</a></li>
    <li><a href="/policies">Policies</a></li>
  </ul>
`));

app.get("/dashboard",(req,res)=>{
  const roi = db.prepare("SELECT * FROM roi_schedule").all();
  res.send(`<h1>Investor Dashboard</h1>
    <p>30% ROI repaid by Year 3; 15% annually Y4–10; capped at 10 years.</p>
    <pre>${JSON.stringify(roi,null,2)}</pre>`);
});

app.get("/consent",(req,res)=>res.send(`
  <h1>Cookie Consent</h1>
  <form method="POST" action="/consent">
    <label>Jurisdiction:
      <select name="jurisdiction">
        <option>EU</option><option>US-CA</option><option>GLOBAL</option>
      </select>
    </label>
    <button type="submit">Accept</button>
  </form>
`));
app.post("/consent",(req,res)=>{
  db.prepare("INSERT INTO consent_logs (jurisdiction,consent_given,created_at) VALUES (?,?,datetime('now'))")
    .run("GLOBAL",1);
  res.send("<p>Consent recorded ✅</p><a href='/'>Back</a>");
});

app.get("/policies",(req,res)=>res.send(`
  <h1>Policies</h1>
  <h2>Privacy Policy</h2>
  <p>We track minimal data (cookies, IP, user agent) for compliance (GDPR, CCPA, etc.).</p>
  <h2>Terms of Use</h2>
  <p>All content is IP of Joshua Anderson & J‑Seth Productions. 10% royalty applies.</p>
  <h2>Disclaimers</h2>
  <p>GENIUS outputs are brand‑safe, but compliance depends on user inputs.</p>
`));

// Content generators (stubs)
function saveAsset(type, body) {
  const title = `${type}-${Date.now()}`;
  db.prepare("INSERT INTO assets (type,title,data,ip_owner,royalty_rate,created_at) VALUES (?,?,?,?,?,datetime('now'))")
    .run(type, title, JSON.stringify(body), "Joshua Anderson & J‑Seth Productions", 0.10);
  return {ok:true, title, ip_owner:"Joshua Anderson & J‑Seth Productions", royalty:0.10};
}

app.post("/generate/ad",(req,res)=>res.json(saveAsset("ad", req.body)));
app.post("/generate/beat",(req,res)=>res.json(saveAsset("beat", req.body)));
app.post("/generate/video",(req,res)=>res.json(saveAsset("video", req.body)));
app.post("/generate/lyric",(req,res)=>res.json(saveAsset("lyric", req.body)));

// DAW upload (royalty enforced)
app.post("/daw/upload",(req,res)=>{
  res.json(saveAsset("upload", {note:"User uploaded content"}));
});

// Start
app.listen(PORT,()=>console.log(`J‑Seth Productions server running at http://localhost:${PORT}`));
{
  "name": "jseth-ecosystem",
  "version": "1.0.0",
  "description": "Node.js backend for GENIUS Ecosystem by J-Seth Productions",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [
    "node",
    "express",
    "jseth",
    "genius"
  ],
  "author": "Joshua Anderson",
  "license": "ISC",
  "dependencies": {
    "better-sqlite3": "^9.4.1",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "helmet": "^6.1.1",
    "morgan": "^1.10.0"
  }
}
