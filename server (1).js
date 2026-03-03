// Example Express server skeleton for CivicEye (for reference only)
const express = require('express');
const app = express();
app.use(express.json());

let complaints = []; // in-memory store (for demo)

app.post('/api/complaints', (req, res) => {
  // expected: { category, description, location, photo }
  const id = 'CIV-' + Math.random().toString(36).slice(2,9).toUpperCase();
  const item = { id, ...req.body, status: 'Pending', created: Date.now() };
  complaints.unshift(item);
  res.status(201).json(item);
});

app.get('/api/complaints', (req, res) => {
  res.json(complaints);
});

app.put('/api/complaints/:id/status', (req, res) => {
  const id = req.params.id;
  const found = complaints.find(c=>c.id===id);
  if(!found) return res.status(404).json({error:'Not found'});
  found.status = req.body.status || found.status;
  res.json(found);
});

const port = process.env.PORT || 4000;
app.listen(port, ()=> console.log('CivicEye server running on', port));
