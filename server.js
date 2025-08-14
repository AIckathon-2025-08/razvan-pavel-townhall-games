const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.json({ limit: '6mb' }));

const DATA_FILE = path.join(__dirname, 'publish.json');

app.get('/', (_, res) => res.sendFile(__dirname + '/index.html'));
app.get('/admin', (_, res) => res.sendFile(__dirname + '/admin.html'));

// API: Get published photo and name
app.get('/api/publish', (req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json({ photo: '', name: '' });
    }
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ photo: '', name: '' });
  }
});

// API: Publish photo and name
app.post('/api/publish', (req, res) => {
  const { photo, name } = req.body;
  if (!photo || !name) return res.status(400).json({ error: 'Missing photo or name' });
  fs.writeFileSync(DATA_FILE, JSON.stringify({ photo, name }));
  res.json({ success: true });
});

app.listen(1992, () => console.log('Server running on port 1992'));
