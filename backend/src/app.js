const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const commentService = require('./services/commentService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await commentService.getMessages();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('send_message', async (data) => {
    try {
      const message = await commentService.createMessage(
        data.userId,
        data.content,
        data.message_type || 'text',
        data.nome || null
      );
      io.emit('new_message', message);
    } catch (err) {
      socket.emit('error', { error: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));