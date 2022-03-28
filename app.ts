import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import gameRouter from './routes/gameRouter';
import { Server as SocketServer } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.of('games').on('connection', (socket) => {
  console.log('user connected, ', socket.id);

  socket.on('disconnect', () => {
    console.log('user disconnected, ', socket.id);
  });
});

// mongoose connection
mongoose.connect(process.env.URI as string);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  const gameSeeksChangeStream = db.collection('gameseeks').watch();

  gameSeeksChangeStream.on('change', (change) => {
    switch (change.operationType) {
      case 'insert': {
        const game = change.fullDocument;
        console.log(game);
        io.of('games').emit('newGame', game);
        break;
      }

      case 'delete': {
        io.of('games').emit('deletedGame', change.documentKey);
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Requested-With, Authorization'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //   res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/games', gameRouter);

const portNo = 8000;
server.listen(portNo, () => console.log(`listening on ${portNo}`));
