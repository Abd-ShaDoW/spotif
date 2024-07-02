"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const image_1 = require("../middleware/image");
const song_1 = require("../middleware/song");
const song_2 = require("../controllers/song");
router.post('/create', auth_1.authMiddleware, song_1.uploadSong, song_2.create);
router.get('/:id', song_2.get);
router.post('/:id', auth_1.authMiddleware, song_2.addArtist);
router.patch('/:id', auth_1.authMiddleware, image_1.uploadImage, song_2.update);
router.post('/favorite', auth_1.authMiddleware, song_2.addFavorite);
router.delete('/unfavorite', auth_1.authMiddleware, song_2.unfavorite);
router.get('/getfavorite', auth_1.authMiddleware, song_2.getFavorites);
exports.default = router;
//# sourceMappingURL=song.js.map