"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const image_1 = require("../middleware/image");
const playlist_1 = require("../controllers/playlist");
router.post('/create', auth_1.authMiddleware, image_1.uploadImage, playlist_1.create);
router.get('/:id', playlist_1.get);
router.patch('/:id', auth_1.authMiddleware, image_1.uploadImage, playlist_1.update);
router.post('/addSong', auth_1.authMiddleware, playlist_1.addSong);
router.delete('/deleteSong', auth_1.authMiddleware, playlist_1.deleteSong);
exports.default = router;
//# sourceMappingURL=playlist.js.map