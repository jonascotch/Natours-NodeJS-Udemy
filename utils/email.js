const nodemailer = require('nodemailer');

const sendEmail = async function (options) {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'ff73eda38039e3',
      pass: 'e134a944928da5',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Joao',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
