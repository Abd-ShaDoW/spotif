"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordResetSchema = exports.authSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.authSchema = joi_1.default.object({
    email: joi_1.default.string().email().lowercase().required(),
    password: joi_1.default.string().min(5).required(),
    name: joi_1.default.string().required(),
});
exports.passwordResetSchema = joi_1.default.object({
    password: joi_1.default.string().min(5).required(),
});
//# sourceMappingURL=validate.js.map