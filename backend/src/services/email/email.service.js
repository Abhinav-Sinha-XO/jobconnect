const transporter = require("../../config/mail");



const sendEmail = async ({ to, subject, text, html }) => {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    });
};

module.exports = {
    sendEmail
};