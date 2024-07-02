"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = void 0;
const crypto_1 = require("crypto");
const generateToken = (length = 32) => {
    return (0, crypto_1.randomBytes)(length).toString('hex');
};
exports.generateToken = generateToken;
//# sourceMappingURL=token.js.map