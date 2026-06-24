// IE Maker Lab — Shared Data Server
// Run:  npm install express cors   then   node server.js
// All browsers on the same network share data via this server.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3456;
const DATA_FILE = path.join(__dirname, 'shared-data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// ── Helpers ──
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch (e) { console.error('Load error:', e.message); }
  return { menu: [], guide: {}, tasks: [], signoffs: {} };
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) { console.error('Save error:', e.message); return false; }
}

// ── API ──
// GET  /api/data        — load all shared data
// POST /api/data        — save all shared data
// GET  /api/data/:key   — load one key (menu / guide / tasks / signoffs)
// POST /api/data/:key   — save one key

app.get('/api/data', (req, res) => {
  res.json(loadData());
});

app.post('/api/data', (req, res) => {
  const ok = saveData(req.body);
  res.json({ ok });
});

app.get('/api/data/:key', (req, res) => {
  const data = loadData();
  res.json(data[req.params.key] || null);
});

app.post('/api/data/:key', (req, res) => {
  const data = loadData();
  data[req.params.key] = req.body;
  const ok = saveData(data);
  res.json({ ok });
});

// ── Index route ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  IE Maker Lab server running at http://localhost:${PORT}\n`);
  console.log(`  Open this address on every computer in the same network.\n`);
  console.log(`  Data file: ${DATA_FILE}\n`);
});
