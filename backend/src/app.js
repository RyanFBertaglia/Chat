const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const commentService = require('./services/commentService');
const authService = require('./services/authService');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});


app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/register', async (req, res) => {
  try {
    const user = req.body;
    console.log(user);
    const result = await authService.createUser(user.name, user.password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const result = await authService.authenticateUser(name, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login-temporario', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await authService.createTemporaryUser(name);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


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
        data.name || null
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