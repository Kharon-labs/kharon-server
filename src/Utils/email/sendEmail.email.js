const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
require('dotenv').config();

const sendEmail = async (email, subject, payload, template) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: true,
            auth : {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const source = fs.readFileSync(path.join(__dirname, template), "utf8");
        const compiledTemplate = handlebars.compile(source);
        const mailOptions = {
                from: process.env.FROM_EMAIL,
                to: email,
                subject: subject,
                html: compiledTemplate(payload),
            };
        
        //send email
        const info = await transporter.sendMail(mailOptions);

        return {
            success: true,
            message: "Email sent successfully",
            info: info.response,
        };
    } catch(err) {
        return {
            success: false,
            message: "Failed to send email",
            error: err.message || err,
        }
    }
};

module.exports = sendEmail;