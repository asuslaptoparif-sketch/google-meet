const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = {};
const socketToRoom = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomID) => {
    if (users[roomID]) {
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    console.log(`User ${socket.id} joined room ${roomID}`);
    socket.emit('all-users', usersInThisRoom);
  });

  socket.on('sending-signal', (payload) => {
    console.log(`Relaying signal from ${payload.callerID} to ${payload.userToSignal}`);
    io.to(payload.userToSignal).emit('user-joined', {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on('returning-signal', (payload) => {
    console.log(`Returning signal to ${payload.callerID}`);
    io.to(payload.callerID).emit('receiving-returned-signal', {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on('disconnect', () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;
      if (room.length === 0) {
        delete users[roomID];
      }
    }
    delete socketToRoom[socket.id];
    socket.broadcast.emit('user-left', socket.id);
    console.log('User disconnected:', socket.id);
  });

  socket.on('send-message', (data) => {
    const roomID = socketToRoom[socket.id];
    if (roomID) {
      socket.to(roomID).emit('receive-message', {
        text: data.text,
        senderId: socket.id,
        senderName: data.senderName,
        timestamp: new Date().toISOString(),
      });
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Signaling server is running on port ${PORT}`));
