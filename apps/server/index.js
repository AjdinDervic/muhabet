const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const activeUsers = new Map();


function makeUsername() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `guest-${n}`;
}

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/users/active', (_req, res) => {
  res.json(Array.from(activeUsers.values()));
});

const PORT = 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {origin: 'http://localhost:5173'},
});

//Listen for new socket connections
io.on('connection', (socket) => {
  
   console.log('socket connected:', socket.id);

   // assign random username for this connection
  const user = { id: socket.id, username: makeUsername() };
  activeUsers.set(socket.id, user);


  socket.on('message:send', (payload) => {
  const body = String(payload?.body ?? '').trim();
  if (!body || body.length > 500) return;

  const user = activeUsers.get(socket.id) || { id: socket.id, username: 'guest-0000' };

  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    body,
    senderId: user.id,
    username: user.username,
    createdAt: new Date().toISOString(),
  };

  io.emit('message_created', message);
});

  //notify everyone
  io.emit('user_joined', user);

  //send hello to new user
  socket.emit('hello', { msg: `Welcome to Muhabet, ${user.username}!` });

  socket.on('disconnect', (reason) => {
    const u = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    if (u) io.emit('user_left', u);
    console.log('socket disconnected:', socket.id, reason);
  });
});

server.listen(PORT, ()=> {
  console.log(`API + WS listening at http://localhost:${PORT}`);
});
