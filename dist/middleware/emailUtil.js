"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendEmailConfirmation = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.Email,
        pass: process.env.AppPassword,
    },
});
const sendEmail = async (to, subject, text, html) => {
    const mailOption = {
        from: process.env.Email,
        to,
        subject,
        text,
        html,
    };
    return transporter.sendMail(mailOption);
};
const sendEmailConfirmation = async (userEmail, token, userType) => {
    const confirmationUrl = `http://localhost:3000/${userType.toLowerCase()}/confirm-email?token=${token}`;
    const subject = 'Email confirmation';
    const text = 'Please confirm your emial by clicking the following link: ${confirmationUrl}`';
    const html = `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`;
    await sendEmail(userEmail, subject, text, html);
};
exports.sendEmailConfirmation = sendEmailConfirmation;
const sendPasswordResetEmail = async (userEmail, token, userType) => {
    const resetUrl = `http://localhost:3000/${userType.toLowerCase()}/reset-password?token=${token}`;
    const subject = 'Password Reset';
    const text = `You can reset your password by clicking the following link: ${resetUrl}`;
    const html = `<p>You can reset your password by clicking the following link: <a href="${resetUrl}">${resetUrl}</a></p>`;
    await sendEmail(userEmail, subject, text, html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=emailUtil.js.map