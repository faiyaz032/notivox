import { MailOptions } from 'nodemailer/lib/json-transport';

export type NotificationJob = {
  type: 'email' | 'sms' | 'push';
  payload: MailOptions;
  adapterName: 'nodemailer' | 'twilio' | 'firebase';
};
