const nodemailer = require("nodemailer");
const CustomError = require("../errors/CustomError");
const Mailgen = require("mailgen");

const sendEmail = async (user, subject, content, url) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    const MailGenerator = new Mailgen({
      theme: "salted",
      product: {
        name: "Mailgen",
        link: "https://mailgen.js/"
      }
    });

    const response = {
      body: {
        greeting: "Dear User",
        intro: content,
        action: {
          instructions: `Click the button below to ${subject}:`,
          button: {
            color: "#DC4D2F",
            text: subject,
            link: url
          }
        },
        outro:
          "Thank you for taking the time to ensure the security of your account."
      }
    };

    const mail = MailGenerator.generate(response);
    const message = {
      from: `My Games ${process.env.SMTP_USER}`,
      to: user.email,
      subject: subject,
      html: mail
    };

    const info = await transporter.sendMail(message);
    return info;
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();
    throw new CustomError(
      `Email couldn't be Sent: ${err.response}`,
      err.responseCode
    );
  }
};
module.exports = sendEmail;
