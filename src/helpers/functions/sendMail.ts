import Mailgen from "mailgen";
import nodemailer from "nodemailer";
import CustomError from "../errors/CustomError";

interface User {
  email: string;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  verificationToken?: string;
  verificationExpire?: Date;
  save: () => Promise<void>;
}

interface MailContent {
  body: {
    greeting: string;
    intro: string;
    action: {
      instructions: string;
      button: {
        color: string;
        text: string;
        link: string;
      };
    };
    outro: string;
  };
}

const sendEmail = async (
  user: any,
  subject: string,
  content: string,
  url: string
): Promise<any> => {
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

    const response: MailContent = {
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
  } catch (err: any) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.verificationToken = undefined;
    user.verificationExpire = undefined;
    await user.save();
    console.error("ERROR: ", err);
    throw new CustomError(
      `Email couldn't be Sent: ${err.response}`,
      err.responseCode
    );
  }
};
export default sendEmail;
