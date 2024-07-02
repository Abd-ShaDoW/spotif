"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.get = exports.create = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const elasticsearchClient_1 = __importDefault(require("../config/elasticsearchClient"));
// Todo : add update and delete album functions
const create = async (req, res) => {
    try {
        // Image path
        const imagePath = req.file ? req.file.path : null;
        // Create album
        const album = await prismaClient_1.default.album.create({
            data: {
                title: req.body.title,
                artist_id: req.artist.id,
                image: imagePath,
            },
            include: { artist: { select: { name: true } } },
        });
        // Create album index in elastic
        const elastic = await elasticsearchClient_1.default.index({
            index: 'albums',
            id: album.id.toString(),
            body: {
                title: album.title,
                artist: { id: album.artist_id, name: album.artist.name },
                image: album.image,
            },
        });
        return res.status(201).json({ album, elastic });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ e: 'Failed to create album' });
    }
};
exports.create = create;
const get = async (req, res) => {
    try {
        const { id } = req.params;
        // Get album
        const album = await prismaClient_1.default.album.findUnique({
            where: { id: +id },
            select: { song: true },
        });
        // Get album from elastic
        const elastic = await elasticsearchClient_1.default.get({
            index: 'albums',
            id: id.toString(),
        });
        return res.status(200).json({ album, elastic });
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to get album' });
    }
};
exports.get = get;
//# sourceMappingURL=album.js.map