

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const loginLink = `${process.env.FRONTEND_URL}/login`;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// MEMBER SET PASSWORD EMAIL

export const sendSetPasswordEmail = async (
    toEmail,
    name,
    rawToken
) => {

    const setPasswordLink =
        `${process.env.FRONTEND_URL}/set-password?token=${rawToken}`;

    await transporter.sendMail({
        from: `"Gym Management" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Set your password to activate your membership account",

        html: `
            <p>Hi ${name},</p>

            <p>
                Your member account has been created.
                Click the link below to set your password:
            </p>

            <p>
                <a href="${setPasswordLink}">
                    ${setPasswordLink}
                </a>
            </p>

            <p>
                This link will expire in 24 hours.
            </p>
        `
    });
};



// BRANCH ADMIN EMAIL


export const sendBranchAdminCredentialsEmail = async (
    toEmail,
    adminName,
    branchName,
    password
) => {

    const loginLink =
        `${process.env.FRONTEND_URL}/login`;

    await transporter.sendMail({
        from: `"Gym Management" <${process.env.EMAIL_USER}>`,
        to: toEmail,

        subject: "Your Branch Admin Account Has Been Created",

        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">

                <h2>Welcome ${adminName}!</h2>

                <p>
                    Your Branch Admin account has been created successfully.
                </p>

                <p>
                    <strong>Branch:</strong> ${branchName}
                </p>

                <p>
                    <strong>Login Email:</strong> ${toEmail}
                </p>

                <p>
                    <strong>Password:</strong> ${password}
                </p>

                <p>
                    <strong>Login:</strong>
                    <a href="${loginLink}">
                        Login to Gym Management
                    </a>
                </p>

                <p>
                    Please login and change your password after your first login.
                </p>

                <p>
                    Regards,<br/>
                    Gym Management Team
                </p>

            </div>
        `
    });
};