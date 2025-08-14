const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.json({ limit: '6mb' }));

const DATA_FILE = path.join(__dirname, 'db/publish.json');
const VOTES_FILE = path.join(__dirname, 'db/votes.json');
const LIE_FILE = path.join(__dirname, 'db/lie.json');

function clearVotes() {
  fs.writeFileSync(VOTES_FILE, JSON.stringify({ 1: 0, 2: 0, 3: 0 }));
}

app.get('/', (_, res) => res.sendFile(__dirname + '/index.html'));
app.get('/admin', (_, res) => res.sendFile(__dirname + '/admin.html'));
app.get('/results', (_, res) => res.sendFile(__dirname + '/results.html'));

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

// API: Get voting results
app.get('/api/results', (req, res) => {
  try {
    if (fs.existsSync(VOTES_FILE)) {
      const votes = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.json(votes);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json({ 1: 0, 2: 0, 3: 0 });
    }
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ 1: 0, 2: 0, 3: 0 });
  }
});

// API: Get the current lie
app.get('/api/lie', (req, res) => {
  try {
    if (fs.existsSync(LIE_FILE)) {
      const data = JSON.parse(fs.readFileSync(LIE_FILE, 'utf8'));
      res.setHeader('Content-Type', 'application/json');
      res.json(data);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.json({ lie: null });
    }
  } catch (err) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ lie: null });
  }
});

// API: Set the lie (admin only)
app.post('/api/lie', (req, res) => {
  const { lie } = req.body;
  if (![1, 2, 3].includes(lie)) return res.status(400).json({ error: 'Invalid story number' });
  fs.writeFileSync(LIE_FILE, JSON.stringify({ lie }));
  res.json({ success: true, lie });
});

// API: Publish photo and name
app.post('/api/publish', (req, res) => {
  const { photo, name } = req.body;
  if (!photo || !name) return res.status(400).json({ error: 'Missing photo or name' });
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  fs.writeFileSync(DATA_FILE, JSON.stringify({ photo, name, date: today }));
  clearVotes(); // Clear votes when publishing new candidate
  fs.writeFileSync(LIE_FILE, JSON.stringify({ lie: null })); // Clear lie when publishing
  res.json({ success: true });
});

// API: Get last publish date
app.get('/api/publish-date', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) return res.json({ date: null });
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json({ date: data.date || null });
});

// API: Get all stories (admin only)
app.get('/api/stories', (req, res) => {
  // For simplicity, stories are hardcoded. In a real app, fetch from a database.
  const stories = [
    { id: 1, content: 'Story 1 content...', author: 'Author 1' },
    { id: 2, content: 'Story 2 content...', author: 'Author 2' },
    { id: 3, content: 'Story 3 content...', author: 'Author 3' },
  ];
  res.json(stories);
});

// API: Reset all townhall data (admin only)
app.post('/api/reset-townhall', (req, res) => {
  // Clear publish.json
  fs.writeFileSync(DATA_FILE, JSON.stringify({ photo: '', name: '' }));
  // Clear votes.json
  clearVotes();
  // Clear lie.json
  fs.writeFileSync(LIE_FILE, JSON.stringify({ lie: null }));
  res.json({ success: true });
});

// API: Vote for a story
app.post('/api/vote', (req, res) => {
  const { story } = req.body;
  if (![1, 2, 3].includes(story)) {
    return res.status(400).json({ error: 'Invalid story number' });
  }
  let votes = { 1: 0, 2: 0, 3: 0 };
  if (fs.existsSync(VOTES_FILE)) {
    try {
      votes = JSON.parse(fs.readFileSync(VOTES_FILE, 'utf8'));
    } catch (err) {
      // If file is corrupted, reset votes
      votes = { 1: 0, 2: 0, 3: 0 };
    }
  }
  votes[story] = (votes[story] || 0) + 1;
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes));
  res.json({ success: true });
});

app.listen(1992, () => console.log('Server running on port 1992'));
