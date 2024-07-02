"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSong = void 0;
const multer_1 = __importDefault(require("multer"));
const songStorage = multer_1.default.diskStorage({
    destination: 'uploads/songs/', // destination directory for songs
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});
// Define file filter for songs
const songFileFilter = async (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only audio files are allowed'), false); // reject other file types
    }
};
exports.uploadSong = (0, multer_1.default)({
    storage: songStorage,
    fileFilter: songFileFilter,
}).single('song');
//# sourceMappingURL=song.js.map