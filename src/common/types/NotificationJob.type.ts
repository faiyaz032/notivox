import { SendEmailOptions } from './MailOptions.types';

export type NotificationJob = {
  type: 'email' | 'sms' | 'push';
  payload: SendEmailOptions;
  adapterName: 'nodemailer' | 'twilio' | 'firebase';
};
