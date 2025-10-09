# Muhabet — ChatApp

## Overview
Muhabet is a simple realtime chat application (global channel + presence).
It assigns a random username on entry, shows active users in a sidebar, 
and displays a global chat feed where everyone can send and receive messages without page refresh.

---

## Features
- Random username assigned on connect.
- Active users list (presence) in the sidebar.
- Global channel: realtime messages (send & receive without refresh).
- Notifications when a new user joins the global chat.
- Responsive UI (mobile + tablet).


---

## Tech stack & concepts
- Frontend: React (Vite), TypeScript, Tailwind / simple CSS.
- Backend: Node.js + Express, Socket.IO (realtime), REST endpoints for history.
- Database: PostgreSQL (messages, channels, users).
- Dev: Docker, docker-compose for local environment.


---

## Quick Setup 
1. Clone repository  
2. Navigate to the root of the repository
3. Run Docker Compose to start the containers: docker-compose up -d

## Deployment
Backend: https://muhabet.onrender.com
Frontend: https://muhabet-web.onrender.com

Note:The deployment is still in progress - the interface loads, 
but some real-time features are currently unstable or not fully connected to the backend.
