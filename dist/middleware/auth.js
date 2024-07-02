"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const entityType_1 = require("../helpers/entityType");
const authMiddleware = async (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        throw Error('No token provided');
    }
    const token = auth.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const { id, name, entityType } = decoded;
        // Determine the appropriate property (user or artist) to attach to the request object
        if (entityType === entityType_1.EntityType.User) {
            req.user = { id, userName: name };
        }
        else if (entityType === entityType_1.EntityType.Artist) {
            req.artist = { id, name };
        }
        else {
            throw new Error('Invalid entity type');
        }
        next();
    }
    catch (e) {
        console.error('JWT verification error:', e);
        throw Error('Invalid token');
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map