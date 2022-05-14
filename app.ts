import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import gameRouter from './routes/gameRouter';
import gameSeekRouter from './routes/gameSeekRouter';
import { Server as SocketServer } from 'socket.io';
import GameSeek from './models/GameSeek';
import { install } from 'source-map-support';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import handleTurnTimer from './utils/handleTurnTimer';

install();

const app = express();
const server = http.createServer(app);
export const io = new SocketServer(server, {
  cors: {
    origin: process.env[`FRONTEND_URL_${process.env.NODE_ENV?.toUpperCase()}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

io.of('games').on('connection', async (socket) => {
  socket.on('disconnect', async () => {
    await GameSeek.findOneAndDelete({ seeker: socket.id });
    console.log('user disconnected, ', socket.id);
  });

  socket.on('joinRoom', (room: string) => {
    socket.join(room);
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
        io.of('games').emit('newGameSeek', game);
        break;
      }

      case 'delete': {
        io.of('games').emit('deletedGameSeek', change.documentKey);
      }
    }
  });

  const gamesChangeStream = db
    .collection('games')
    .watch([], { fullDocument: 'updateLookup' });
  gamesChangeStream.on('change', (change) => {
    if (!change.documentKey) return;
    if (!change.fullDocument) return;

    const gameId = JSON.parse(JSON.stringify(change.documentKey))._id;

    switch (change.operationType) {
      case 'insert': {
        const { turn, active } = change.fullDocument;
        handleTurnTimer(
          gameId,
          active,
          turn,
          change.fullDocument[turn].timeLeft
        );
        break;
      }
      case 'update': {
        io.of('games').to(gameId).emit('update', change.fullDocument);

        const { turn, active } = change.fullDocument;
        handleTurnTimer(
          gameId,
          active,
          turn,
          change.fullDocument[turn].timeLeft
        );
        break;
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env[`FRONTEND_URL_${process.env.NODE_ENV?.toUpperCase()}`],
    credentials: true,
  })
);
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader(
    'Access-Control-Allow-Origin',
    process.env[`FRONTEND_URL_${process.env.NODE_ENV?.toUpperCase()}`] as string
  );

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'true, X-Requested-With');
  res.setHeader('Access-Control-Allow-Headers', 'true');
  // res.setHeader('Content-Type', 'X-Requested-With, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //   res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/games', gameRouter);
app.use('/gameSeeks', gameSeekRouter);

const portNo = 8000;
server.listen(process.env.PORT || portNo, () =>
  console.log(`listening on ${portNo}`)
);
