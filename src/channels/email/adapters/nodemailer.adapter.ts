import { SendEmailOptions } from '../../../common/types/MailOptions.types';
import { NodemailerConfig } from '../../../common/types/Nodemailer.type';
import { RedisConfig } from '../../../common/types/RedisConfig.type';
import { QueueService } from '../../../queue/Queue.service';
import IEmailAdapter from '../IEmailAdapter';
import nodemailer from 'nodemailer';

export class NodemailerAdapter implements IEmailAdapter {
  private transporter: nodemailer.Transporter;
  private queueService?: QueueService;

  constructor(config: NodemailerConfig, redisConfig?: RedisConfig) {
    this.transporter = this.createTransporter(config);
    if (redisConfig) {
      this.queueService = new QueueService(redisConfig);
      this.registerWorker();
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    if (this.queueService) {
      await this.queueService.addJob('email', {
        type: 'email',
        payload: options,
        adapterName: 'nodemailer',
      });
      console.log('Email job added to queue');
    } else {
      this.deliverEmail(options);
    }
  }

  private async registerWorker(): Promise<void> {
    if (!this.queueService) {
      throw new Error('Queue service not initialized');
    }
    this.queueService.registerWorker('email', async (job) => {
      await this.deliverEmail(job.data.payload as SendEmailOptions);
      console.log(`Email job processed: ${job.id}`);
    });
  }

  private async deliverEmail(options: SendEmailOptions): Promise<void> {
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
