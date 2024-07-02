"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSong = exports.addSong = exports.get = exports.update = exports.create = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const util_1 = require("../helpers/util");
// Todo : add update and delete function for the playlist
const create = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : null;
        // Create playlist
        const playlist = await prismaClient_1.default.playlist.create({
            data: { title: req.body.title, user_id: req.user.id, image: imagePath },
        });
        return res.status(200).json(playlist);
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to create playlist' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const id = +req.params.id;
        // Check if playlist exist
        const old = await prismaClient_1.default.playlist.findUnique({ where: { id: +id } });
        if (!old) {
            return res.status(404).json({ e: 'Cant find playlist' });
        }
        const imagePath = req.file ? req.file.path : null;
        const updateImagePath = imagePath || old.image;
        // Update playlist
        const playlist = await prismaClient_1.default.playlist.update({
            where: { id, user_id: req.user.id },
            data: {
                title: req.body.title,
                image: updateImagePath,
            },
        });
        // If there is new imagepath then delete the old if it exist
        (0, util_1.removeOldFile)(imagePath, old.image);
        return res.status(200).json(playlist);
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to update playlist' });
    }
};
exports.update = update;
const get = async (req, res) => {
    try {
        const id = +req.params.id;
        // Get playlist
        const playlist = await prismaClient_1.default.playlist.findUnique({
            where: { id },
            select: { playlist_song: { include: { song: true } } },
        });
        return res.status(200).json(playlist);
    }
    catch (e) {
        return res.status(404).json({ e: 'Failed to get playlist' });
    }
};
exports.get = get;
const addSong = async (req, res) => {
    try {
        // Check if song exist
        const song = await prismaClient_1.default.song.findUnique({
            where: { id: +req.body.song_id },
        });
        if (!song) {
            return res.status(404).json({ e: 'No song' });
        }
        // Check if playlist exist
        const playlist = await prismaClient_1.default.playlist.findUnique({
            where: { id: +req.body.playlist_id, user_id: +req.user.id },
        });
        if (!playlist) {
            return res.status(404).json({ e: 'No playlist' });
        }
        // Check if song exist in playlist
        const existPlaylist_song = await prismaClient_1.default.playlist_song.findFirst({
            where: {
                playlist_id: +req.body.playlist_id,
                song_id: req.body.song_id,
            },
        });
        if (existPlaylist_song) {
            return res.status(400).json({ e: 'Song already in playlist' });
        }
        // Add song to playlist
        const playlist_song = await prismaClient_1.default.playlist_song.create({
            data: {
                song_id: +req.body.song_id,
                playlist_id: +req.body.playlist_id,
            },
        });
        return res.status(200).json(playlist_song);
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to add song' });
    }
};
exports.addSong = addSong;
const deleteSong = async (req, res) => {
    try {
        const { song_id, playlist_id } = req.body;
        // Check if playlist exist
        const playlist = await prismaClient_1.default.playlist.findUnique({
            where: { id: +playlist_id, user_id: +req.user.id },
        });
        if (!playlist) {
            return res.status(404).json({ e: 'No playlist' });
        }
        // Check if the song in playlist
        const check = await prismaClient_1.default.playlist_song.findUnique({
            where: {
                playlist_id_song_id: { playlist_id: +playlist_id, song_id: +song_id },
            },
        });
        if (!check) {
            return res.status(404).json({ e: 'Song not in playlist' });
        }
        // Delete song from playlist
        const playlist_song = await prismaClient_1.default.playlist_song.delete({
            where: {
                playlist_id_song_id: {
                    playlist_id: +playlist_id,
                    song_id: +song_id,
                },
            },
        });
        return res.status(200).json(playlist_song);
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to delete song from playlist' });
    }
};
exports.deleteSong = deleteSong;
//# sourceMappingURL=playlist.js.map