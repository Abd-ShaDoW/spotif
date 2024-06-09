import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import artistRouter from './routers/artist';
import userRouter from './routers/user';
import songRouter from './routers/song';
import albumRouter from './routers/album';
import playlistRouter from './routers/playlist';
import searchRouter from './routers/search';

const app = express();
app.use(express.json());

app.use('/artist', artistRouter);
app.use('/user', userRouter);
app.use('/song', songRouter);
app.use('/album', albumRouter);
app.use('/playlist', playlistRouter);
app.use('/api', searchRouter);

const port = process.env.port || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
