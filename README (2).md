# CivicEye — Backend (Design & Mock)

**Project:** CivicEye — Report. Track. Resolve.  
**Team:** Brogrammers

## Purpose
This repository describes the intended backend for CivicEye.
For the hackathon demo we provided a static frontend. The backend here is a mock Node.js structure and API design for future implementation.

## Suggested APIs
- `POST /api/complaints` — Create complaint (body: category, description, location, photo URL)
- `GET /api/complaints` — List complaints
- `GET /api/complaints/:id` — Get complaint details
- `PUT /api/complaints/:id/status` — Update status (body: status)
- `GET /api/stats` — Basic stats (resolved count, avg resolution time)

## Tech Stack (recommended)
- Node.js + Express
- MongoDB / Firebase Firestore
- Cloud Storage for images
- Deploy: Render / Heroku / Vercel (server)

## server.js (example)
A basic example server file is included for reference. It is **not required** to run the demo.
