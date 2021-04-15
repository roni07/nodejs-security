const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name;
        // this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `NodeJS Secure <${process.env.EMAIL_FROM}>`;
    }

    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            });
        } else {
            return nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }
    }

    async send(subject, message, type) {

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            text: htmlToText.fromString(`
                                        <h1>${this.firstName}</h1>
                                        <p>${message}</p>
                                        <a>${type ? type : ''}${this.url ? this.url : ''}</a>`)
        }

        await this.newTransport().sendMail(mailOptions);
    }

    async sendWelcome() {
        await this.send('Registration Welcome', 'Welcome to the nodeJS security tutorial!','Please visit this link: ');
    }

    async sendPasswordReset() {
        await this.send('Password Reset', 'Your password reset token (only valid for 10 minutes)', 'Password rest token: ');
    }
}