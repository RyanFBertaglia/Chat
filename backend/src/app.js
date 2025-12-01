const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const client = require('prom-client');

const commentService = require('./services/commentService');
const authService = require('./services/authService');

const PhotoService = require('./services/photoService');
const photoService = new PhotoService();


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost"],
    methods: ["GET", "POST"]
  }
});

client.collectDefaultMetrics();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

client.collectDefaultMetrics({ prefix: "backend_" });
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
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
    const offset = parseInt(req.query.offset) || 0;
    const messages = await commentService.getMessages(offset);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:userId/photo', upload.single('photo'), async (req, res) => {
  try {
    if(!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const {userId} = req.params;

    const result = await photoService.setUserPhoto(userId, req.file.buffer);
    if (result.success) {
        res.json({
            success: true,
            message: 'Foto salva com sucesso!',
            data: result
        });
    } else {
        res.status(400).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user/:userId/photo', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await photoService.deleteUserPhoto(userId);
    if (result.success) {
        res.json({
            success: true,
            message: 'Fotos removidas com sucesso!',
            data: result
        });
    } else {
        res.status(400).json({ error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:userId/photo', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await photoService.getUserPhoto(userId);

    if (result.success) {
      res.json({
        success: true,
        message: 'Foto encontrada',
        data: result
      });
    } else {
      res.status(404).json({ error: result.error });
    }
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