const express = require('express');
const cors = require('cors');
const http = require('http'); 
const { Server } = require('socket.io');
const {PrismaClient} = require('@prisma/client');
//const activeUsers = new Map();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';


const prisma = new PrismaClient();
const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN}));
app.use(express.json());

// health checker 
app.get('/healthz', (_req, res) => {
  res.json({ ok: true });
});

const activeUsers = new Map();
function makeUsername(){
  const n = Math.floor(1000 + Math.random() * 9000);
  return `quest-${n}`;
}


// HTTP server + Socket.IO on same port
const server = http.createServer(app);
const io = new Server(server, {
  cors: {origin: FRONTEND_ORIGIN},

});

// Cache the Global chanel id for quick access
let GLOBAL_CHANNEL_ID = null;
async function getGlobalChannelId(){
  const ch = await prisma.channel.findFirst({where: {kind: 'GLOBAL'}});
  if (!ch) throw new Error('Global channel missing - run seed');
  GLOBAL_CHANNEL_ID = ch.id;
  return GLOBAL_CHANNEL_ID;
}


// Active users endpoint
app.get('/api/users/active', (_req, res) => {
  res.json(Array.from(activeUsers.values()));
});

// Messages history endpoint
app.get('/api/messages', async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 100);
    const before = req.query.before ? new Date(req.query.before) : null;
    const channelId = await getGlobalChannelId();

    const where = {channelId};
    if (before && !isNaN(before.getTime())){
      where.createdAt = {lt: before };
    }
    const rows = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { sender: true },
    });

    const items = rows
      .map(r => ({
        id: r.id,
        body: r.body,
        senderId: r.senderId,
        username: r.sender.username,
        createdAt: r.createdAt.toISOString(),
      }))
      .reverse();

      res.json(items);
    } catch (e){
      console.error(e);
      res.status(500).json({error: 'failed_to_fetch_messages'});

    }
});


// Sockets

//Listen for new socket connections
io.on('connection', (socket) => {
  
   //console.log('socket connected:', socket.id);

   // assign random username for this connection
  const user = { id: socket.id, username: makeUsername() };
  activeUsers.set(socket.id, user);

 // Welcome message 
  socket.emit('hello', { 
    msg: `Welcome to Muhabet, ${user.username}!`, 
    me: user 
  });
// Notification that user is joined
  io.emit('user_joined', user);


  socket.on('message:send', async (payload) => {
    try{
  const body = String(payload?.body ?? '').trim();
  if (!body || body.length > 500) return;

  const pres = activeUsers.get(socket.id) || { id: socket.id, username: 'guest-0000' };

await prisma.user.upsert({
  where: {id: pres.id},
  update: {username: pres.username},
  create: {id: pres.id, username: pres.username},
});

const channelId = await getGlobalChannelId();

const row = await prisma.message.create({
  data: {body, senderId: pres.id, channelId},
  include: {sender: true},
});

  const message = {
    id: row.id,
    body: row.body,
    senderId: row.senderId,
    username: row.sender.username,
    createdAt: row.createdAt.toISOString(),
  };

console.log('message:send PERSISTED', row.id);
  io.emit('message_created', message);
} catch(e){
  console.error('message:send failed', e);
}
});

  

socket.on('disconnect', () => {
  const u = activeUsers.get(socket.id);
  activeUsers.delete(socket.id);
  if (u) io.emit('user_left', u);
});

});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=> {
  console.log(`API + WS listening at http://localhost:${PORT}`);
});
