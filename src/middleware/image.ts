import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/images/', // directory for images
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
// file filter for images only
const imageFileFilter = async (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
}).single('image');
