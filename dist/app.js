"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const artist_1 = __importDefault(require("./routers/artist"));
const user_1 = __importDefault(require("./routers/user"));
const song_1 = __importDefault(require("./routers/song"));
const album_1 = __importDefault(require("./routers/album"));
const playlist_1 = __importDefault(require("./routers/playlist"));
const search_1 = __importDefault(require("./routers/search"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/artist', artist_1.default);
app.use('/user', user_1.default);
app.use('/song', song_1.default);
app.use('/album', album_1.default);
app.use('/playlist', playlist_1.default);
app.use('/api', search_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map