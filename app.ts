import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import gameRouter from './routes/gameRouter';
import gameSeekRouter from './routes/gameSeekRouter';
import { Server as SocketServer, Socket } from 'socket.io';
import GameSeek from './models/GameSeek';
import Game from './models/Game';
import dayjs from 'dayjs';
import { install } from 'source-map-support';
import cookieParser from 'cookie-parser';
import cors from 'cors';

install();

const app = express();
const server = http.createServer(app);
export const io = new SocketServer(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

(async function () {
  // const deletedCount = await GameSeek.deleteMany({});
  // console.log(deletedCount);
  // const deletedCount = await Game.deleteMany({});
  // console.log(deletedCount);
  // const game = new Game({
  //   white: {
  //     player: 'ababab',
  //     timeLeft: Date.now(),
  //   },
  //   black: {
  //     player: 'ababab',
  //     timeLeft: Date.now(),
  //   },
  //   time: 30,
  //   increment: 10,
  // });
  // await game.save();
})();

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
        io.of('games').emit('newGame', game);
        break;
      }

      case 'delete': {
        io.of('games').emit('deletedGame', change.documentKey);
      }
    }
  });

  const gamesChangeStream = db
    .collection('games')
    .watch([], { fullDocument: 'updateLookup' });
  gamesChangeStream.on('change', (change) => {
    switch (change.operationType) {
      case 'update': {
        if (!change.documentKey) return;
        const gameId = JSON.parse(JSON.stringify(change.documentKey))._id;
        io.of('games').to(gameId).emit('update', change.fullDocument);
      }
    }
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use((req, res, next) => {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

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
server.listen(portNo, () => console.log(`listening on ${portNo}`));
