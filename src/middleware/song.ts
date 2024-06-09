import multer from 'multer';

const songStorage = multer.diskStorage({
  destination: 'uploads/songs/', // destination directory for songs
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
// Define file filter for songs
const songFileFilter = async (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false); // reject other file types
  }
};

export const uploadSong = multer({
  storage: songStorage,
  fileFilter: songFileFilter,
}).single('song');
