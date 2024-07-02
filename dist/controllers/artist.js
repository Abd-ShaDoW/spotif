"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.update = exports.signIn = exports.confirmEmail = exports.signUp = void 0;
const prismaClient_1 = __importDefault(require("../config/prismaClient"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailUtil_1 = require("../middleware/emailUtil");
const entityType_1 = require("../helpers/entityType");
const token_1 = require("../helpers/token");
const validate_1 = require("../helpers/validate");
const elasticsearchClient_1 = __importDefault(require("../config/elasticsearchClient"));
const util_1 = require("../helpers/util");
const signUp = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : null;
        // Validation
        const result = await validate_1.authSchema.validateAsync(req.body);
        // Check if email already used as artist
        const used = await prismaClient_1.default.artist.findFirst({
            where: { email: result.email },
        });
        if (used) {
            return res.status(409).json({ e: 'email already used' });
        }
        const emailConfirmationToken = (0, token_1.generateToken)();
        // Create artist
        const artist = await prismaClient_1.default.artist.create({
            data: {
                email: result.email,
                name: result.name,
                password: await bcrypt_1.default.hash(result.password, 10),
                emailConfirmationToken,
                image: imagePath,
            },
        });
        // Create artist in elastic
        const elastic = await elasticsearchClient_1.default.index({
            index: 'artists',
            id: artist.id.toString(),
            body: {
                name: artist.name,
                image: artist.image,
            },
        });
        // Send email to the artist to confirm
        await (0, emailUtil_1.sendEmailConfirmation)(result.email, emailConfirmationToken, entityType_1.EntityType.Artist);
        return res.status(201).json({ artist, elastic });
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ e: 'Failed to signup' });
    }
};
exports.signUp = signUp;
const confirmEmail = async (req, res) => {
    try {
        const { token } = req.query;
        // Find the artist using the token
        const artist = await prismaClient_1.default.artist.findUnique({
            where: { emailConfirmationToken: token },
        });
        if (!artist) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        // Update the artist to make his email verified
        await prismaClient_1.default.artist.update({
            where: { id: artist.id },
            data: {
                emailConfirmed: true,
                emailConfirmationToken: null,
            },
        });
        res.status(200).json({ message: 'Email confirmed' });
    }
    catch (error) {
        res.status(500).json({ error: 'Email confirmation failed' });
    }
};
exports.confirmEmail = confirmEmail;
const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            throw Error('Please provide email and password');
        }
        // Find artist
        const artist = await prismaClient_1.default.artist.findFirst({
            where: { email: req.body.email },
        });
        if (!artist) {
            return new Error('invalid credentials');
        }
        // Compare passwords
        const compare = await bcrypt_1.default.compare(password, artist.password);
        if (!compare) {
            return new Error('invalid password');
        }
        const token = jsonwebtoken_1.default.sign({
            id: artist.id,
            name: artist.name,
            entityType: entityType_1.EntityType.Artist,
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
        return res.status(200).json({ artist, token });
    }
    catch (e) {
        return res.status(500).json({ e: 'failed to sign in' });
    }
};
exports.signIn = signIn;
const update = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : null;
        // Find artist
        const old = await prismaClient_1.default.artist.findFirst({
            where: { id: req.artist.id },
        });
        if (!old) {
            return res.status(404).json({ e: 'Artist not found' });
        }
        const updateImagePath = imagePath || old.image;
        // Update artist
        const artist = await prismaClient_1.default.artist.update({
            where: {
                id: req.artist.id,
            },
            data: {
                name: req.body.name,
                image: updateImagePath,
            },
        });
        await elasticsearchClient_1.default.update({
            index: 'artists',
            id: artist.id.toString(),
            body: {
                doc: { name: artist.name, image: artist.image },
            },
        });
        // Update artist data in albums
        const updateAlbums = async (artistId, artistName) => {
            const albums = await prismaClient_1.default.album.findMany({
                where: { artist_id: artistId },
            });
            if (albums.length === 0) {
                return;
            }
            const albumUpdates = albums.flatMap((album) => [
                { update: { _index: 'albums', _id: album.id.toString() } },
                { doc: { artist: { id: artistId, name: artistName } } },
            ]);
            console.log('album update', JSON.stringify(albumUpdates, null, 2));
            const response = await elasticsearchClient_1.default.bulk({ body: albumUpdates });
            console.log('Album bulk update response:', JSON.stringify(response, null, 2));
        };
        // Update artist data in songs
        const updateSongs = async (artistId, artistName) => {
            const songs = await prismaClient_1.default.song.findMany({
                where: { song_artist: { some: { artist_id: artistId } } },
                include: { song_artist: { include: { artist: true } } },
            });
            if (songs.length === 0) {
                return;
            }
            const songUpdates = songs.flatMap((song) => [
                { update: { _index: 'songs', _id: song.id.toString() } },
                {
                    doc: {
                        artist: song.song_artist.map((sa) => sa.artist_id === artistId
                            ? { id: sa.artist.id, name: artistName }
                            : { id: sa.artist.id, name: sa.artist.name }),
                    },
                },
            ]);
            console.log('Song updates:', JSON.stringify(songUpdates, null, 2));
            const response = await elasticsearchClient_1.default.bulk({ body: songUpdates });
            console.log('Song bulk update response:', JSON.stringify(response, null, 2));
        };
        await updateAlbums(artist.id, artist.name);
        await updateSongs(artist.id, artist.name);
        // If there is new imagepath then delete the old if it exist
        (0, util_1.removeOldFile)(imagePath, old.image);
        return res.status(200).json(artist);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({ e: 'failed to update' });
    }
};
exports.update = update;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Find artist
        const artist = await prismaClient_1.default.artist.findUnique({
            where: { email },
        });
        if (!artist) {
            return res.status(400).json({ e: 'Email not found' });
        }
        const passwordResetToken = (0, token_1.generateToken)();
        // Update the artist token
        await prismaClient_1.default.artist.update({
            where: { id: artist.id },
            data: {
                passwordResetToken,
            },
        });
        // Send password reset email
        await (0, emailUtil_1.sendPasswordResetEmail)(email, passwordResetToken, entityType_1.EntityType.Artist);
        res.status(200).json('Password reset email sent');
    }
    catch (e) {
        res.status(500).json({ e: 'Failed to send password reset email' });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        // Validation
        const result = await validate_1.passwordResetSchema.validateAsync(req.body);
        // Find the artist
        const artist = await prismaClient_1.default.artist.findUnique({
            where: {
                passwordResetToken: token,
            },
        });
        if (!artist) {
            return res.status(400).json({ e: 'Invalid or expired token' });
        }
        // Update the artist password
        await prismaClient_1.default.artist.update({
            where: { id: artist.id },
            data: {
                password: await bcrypt_1.default.hash(result.password, 10),
                passwordResetToken: null,
            },
        });
        res.status(200).json('Password reset successfully');
    }
    catch (e) {
        res.status(500).json({ e: 'Failed to reset password' });
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=artist.js.map