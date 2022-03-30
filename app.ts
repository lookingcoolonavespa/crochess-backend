import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import gameRouter from './routes/gameRouter';
import gameSeekRouter from './routes/gameSeekRouter';
import { Server as SocketServer, Socket } from 'socket.io';
import GameSeek from './models/GameSeek';

const app = express();
const server = http.createServer(app);
export const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.of('games').on('connection', async (socket) => {
  console.log('user connected, ', socket.id);
  // const deletedCount = await GameSeek.deleteMany({});
  // console.log(deletedCount);

  socket.on('disconnect', async () => {
    await GameSeek.findOneAndDelete({ seeker: socket.id });
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
        console.log(change.documentKey);
        io.of('games').emit('deletedGame', change.documentKey);
      }
    }
  });

  const gamesChangeStream = db.collection('games').watch();
  gamesChangeStream.on('change', (change) => {
    switch (change.operationType) {
      case 'update': {
        if (!change.documentKey) return;
        const gameId = change.documentKey?.toString();
        io.of(gameId).emit('update', change.fullDocument);
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
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
app.use('/gameSeeks', gameSeekRouter);

const portNo = 8000;
server.listen(portNo, () => console.log(`listening on ${portNo}`));
