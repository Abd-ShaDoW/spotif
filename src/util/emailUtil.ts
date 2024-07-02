import nodemailer, { Transporter } from 'nodemailer';
import { EntityType } from '../entity/userTypes';
import dotenv from 'dotenv';
dotenv.config();

const transporter: Transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html: string
) => {
  const mailOption = {
    from: process.env.Email,
    to,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOption);
};

export const sendEmailConfirmation = async (
  userEmail: string,
  token: string,
  userType: EntityType
) => {
  const confirmationUrl = `http://localhost:3000/${userType.toLowerCase()}/confirm-email?token=${token}`;
  const subject = 'Email confirmation';
  const text =
    'Please confirm your emial by clicking the following link: ${confirmationUrl}`';
  const html = `<p>Please confirm your email by clicking the following link: <a href="${confirmationUrl}">${confirmationUrl}</a></p>`;

  await sendEmail(userEmail, subject, text, html);
};

export const sendPasswordResetEmail = async (
  userEmail: string,
  token: string,
  userType: EntityType
) => {
  const resetUrl = `http://localhost:3000/${userType.toLowerCase()}/reset-password?token=${token}`;
  const subject = 'Password Reset';
  const text = `You can reset your password by clicking the following link: ${resetUrl}`;
  const html = `<p>You can reset your password by clicking the following link: <a href="${resetUrl}">${resetUrl}</a></p>`;

  await sendEmail(userEmail, subject, text, html);
};
