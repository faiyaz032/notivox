import { SendEmailOptions } from '../../../common/types/MailOptions.types';
import { NodemailerConfig } from '../../../common/types/Nodemailer.type';
import IEmailAdapter from '../IEmailAdapter';
import nodemailer from 'nodemailer';

export class NodemailerAdapter implements IEmailAdapter {
  private transporter: nodemailer.Transporter;

  constructor(config: NodemailerConfig) {
    this.transporter = this.createTransporter(config);
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      };

      return this.transporter
        .sendMail(mailOptions)
        .then(() => {
          console.log('Email sent successfully');
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          throw error;
        });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  private createTransporter(config: NodemailerConfig): nodemailer.Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }
}
