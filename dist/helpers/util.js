"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeOldFile = removeOldFile;
const fs_1 = __importDefault(require("fs"));
function removeOldFile(newImagePath, oldImagePath) {
    if (newImagePath && oldImagePath) {
        if (fs_1.default.existsSync(oldImagePath)) {
            fs_1.default.unlinkSync(oldImagePath);
        }
    }
}
//# sourceMappingURL=util.js.map