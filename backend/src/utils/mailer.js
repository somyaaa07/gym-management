// utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

export const sendSetPasswordEmail = async (toEmail, name, rawToken) => {
    const setPasswordLink = `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;

    await transporter.sendMail({
        from: `"Gym Management" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Set your password to activate your membership account",
        html: `
            <p>Hi ${name},</p>
            <p>Your member account has been created. Click the link below to set your password:</p>
            <p><a href="${setPasswordLink}">${setPasswordLink}</a></p>
            <p>This link will expire in 24 hours.</p>
        `
    });
};