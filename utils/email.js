const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Joao <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        host: process.env.SENDBLUE_HOST,
        port: process.env.SENDBLUE_PORT,
        auth: {
          user: process.env.SENDBLUE_USER,
          pass: process.env.SENDBLUE_PASS,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on PUG template
    const html = pug.renderFile(
      `${__dirname}/../views/email/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      },
    );

    // 2) Define email options
    const text = htmlToText(html);
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    // 3) Create a transport
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send(
      'welcome',
      'Welcome to the Natours Family!',
    );
  }

  async sendPasswordReset() {
    await this.send(
      'forgotPassword',
      'Your password reset token (valid for 10 minutes)',
    );
  }
};
