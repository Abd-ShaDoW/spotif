import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/images/', // destination directory for images
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
// Define file filter for images
const imageFileFilter = async (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false); // reject other file types
  }
};

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
}).single('image');
