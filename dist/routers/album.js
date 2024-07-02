"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const image_1 = require("../middleware/image");
const album_1 = require("../controllers/album");
router.post('/create', auth_1.authMiddleware, image_1.uploadImage, album_1.create);
router.get('/:id', album_1.get);
exports.default = router;
//# sourceMappingURL=album.js.map