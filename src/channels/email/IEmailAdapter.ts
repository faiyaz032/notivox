import { SendEmailOptions } from '../../common/types/MailOptions.types';

export default interface IEmailAdapter {
  sendEmail(options: SendEmailOptions): Promise<void>;
}
