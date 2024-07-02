"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const image_1 = require("../middleware/image");
const artist_1 = require("../controllers/artist");
router.post('/signup', image_1.uploadImage, artist_1.signUp);
router.get('/confirm-email', artist_1.confirmEmail);
router.post('/request-password-reset', artist_1.requestPasswordReset);
router.post('/reset-password', artist_1.resetPassword);
router.post('/signin', artist_1.signIn);
router.patch('/update', auth_1.authMiddleware, image_1.uploadImage, artist_1.update);
exports.default = router;
//# sourceMappingURL=artist.js.map