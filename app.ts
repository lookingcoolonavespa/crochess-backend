import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import gameRouter from './routes/gameRouter';
import WebSocket from 'ws';

const app = express();
const ws = new WebSocket.Server();

// mongoose connection
mongoose.connect(process.env.URI as string);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  // allow access to websocket server in routes
  req.ws = ws;
  return next();
});

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
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  //   res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.use('/games', gameRouter);

const portNo = 8000;
app.listen(portNo, () => console.log(`server running on port ${portNo}`));
