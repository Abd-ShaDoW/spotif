"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middleware/auth");
const image_1 = require("../middleware/image");
const user_1 = require("../controllers/user");
router.post('/signup', image_1.uploadImage, user_1.signUp);
router.get('/confirm-email', user_1.confirmEmail);
router.post('/signin', user_1.signIn);
router.patch('/update', auth_1.authMiddleware, image_1.uploadImage, user_1.update);
router.post('/request-password-reset', user_1.requestPasswordReset);
router.post('/reset-password', user_1.resetPassword);
exports.default = router;
//# sourceMappingURL=user.js.map