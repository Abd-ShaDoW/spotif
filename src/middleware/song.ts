import multer from 'multer';

const songStorage = multer.diskStorage({
  destination: 'uploads/songs/', // directory for songs
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
//  file filter for audio files only
const songFileFilter = async (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'), false);
  }
};

export const uploadSong = multer({
  storage: songStorage,
  fileFilter: songFileFilter,
}).single('song');
