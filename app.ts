import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';

const app = express();

// mongoose connection
mongoose.connect(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(3000, () => console.log(`server running on port 3000`));
