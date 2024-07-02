import express from 'express';
import dotenv from 'dotenv';
import artistRouter from './routers/artist';
import userRouter from './routers/user';
import songRouter from './routers/song';
import albumRouter from './routers/album';
import playlistRouter from './routers/playlist';
import searchRouter from './routers/search';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/artist', artistRouter);
app.use('/user', userRouter);
app.use('/song', songRouter);
app.use('/album', albumRouter);
app.use('/playlist', playlistRouter);
app.use('/api', searchRouter);

export default app;
