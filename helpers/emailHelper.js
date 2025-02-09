const nodemailer = require('nodemailer');
const { signEmailVerificationToken } = require('./tokenHelper');
const { CustomError } = require('./errorHelper');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
exports.sendVerificationEmail = async (user) => {
    try {
        const token = await signEmailVerificationToken(user);
        const link = `${process.env.base_url}/verify-email/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Please Verify Your Email',
            html: `<a href=${link}>Click here</a> to verify your email`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new CustomError('Failed to send verification email.');
    }
};
