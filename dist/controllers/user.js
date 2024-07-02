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
const util_1 = require("../helpers/util");
const signUp = async (req, res) => {
    try {
        const imagePath = req.file ? req.file.path : null;
        // Validation
        const result = await validate_1.authSchema.validateAsync(req.body);
        // Check if email is used
        const used = await prismaClient_1.default.user.findFirst({
            where: { email: result.email },
        });
        if (used) {
            return res.status(409).json({ e: 'Email already used' });
        }
        const emailConfirmationToken = (0, token_1.generateToken)();
        // Create user
        const user = await prismaClient_1.default.user.create({
            data: {
                email: result.email,
                userName: result.name,
                password: await bcrypt_1.default.hash(result.password, 10),
                emailConfirmationToken,
                image: imagePath,
            },
        });
        // Send email to the user to confirm
        await (0, emailUtil_1.sendEmailConfirmation)(result.email, emailConfirmationToken, entityType_1.EntityType.User);
        return res.status(201).json(user);
    }
    catch (e) {
        return res.status(400).json({ e: 'Failed to signup' });
    }
};
exports.signUp = signUp;
const confirmEmail = async (req, res) => {
    try {
        const { token } = req.query;
        // Find the user using the token
        const user = await prismaClient_1.default.user.findUnique({
            where: { emailConfirmationToken: token },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        // Update the user to make his email verified
        await prismaClient_1.default.user.update({
            where: { id: user.id },
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
        // Find user
        const user = await prismaClient_1.default.user.findFirst({
            where: { email: req.body.email },
        });
        if (!user) {
            return res.status(401).json({ e: 'Invalid credentials' });
        }
        const compare = await bcrypt_1.default.compare(password, user.password);
        if (!compare) {
            return res.status(401).json({ e: 'Invalid password' });
        }
        // Token assign
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            name: user.userName,
            entityType: entityType_1.EntityType.User,
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_LIFETIME });
        return res.status(200).json({ user, token });
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to sign in' });
    }
};
exports.signIn = signIn;
const update = async (req, res) => {
    try {
        const imagepath = req.file ? req.file.path : null;
        // Check if user exist
        const old = await prismaClient_1.default.user.findFirst({ where: { id: req.user.id } });
        if (!old) {
            return res.status(404).json({ e: 'User not found' });
        }
        // Update user
        const user = await prismaClient_1.default.user.update({
            where: {
                id: req.user.id,
            },
            data: {
                userName: req.body.userName,
                image: imagepath,
            },
        });
        // If there is new imagepath then delete the old if it exist
        (0, util_1.removeOldFile)(imagepath, old.image);
        return res.status(200).json(user);
    }
    catch (e) {
        return res.status(500).json({ e: 'Failed to update' });
    }
};
exports.update = update;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        // Find user
        const user = await prismaClient_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(400).json({ e: 'Email not found' });
        }
        const passwordResetToken = (0, token_1.generateToken)();
        // Update the user token
        await prismaClient_1.default.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken,
            },
        });
        // Send password reset email
        await (0, emailUtil_1.sendPasswordResetEmail)(email, passwordResetToken, entityType_1.EntityType.User);
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
        // Find the user
        const user = await prismaClient_1.default.user.findUnique({
            where: {
                passwordResetToken: token,
            },
        });
        if (!user) {
            return res.status(400).json({ e: 'Invalid or expired token' });
        }
        // Update the user password
        await prismaClient_1.default.user.update({
            where: { id: user.id },
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
//# sourceMappingURL=user.js.map