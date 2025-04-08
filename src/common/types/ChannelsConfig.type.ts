import { NodemailerConfig } from './Nodemailer.type';

export type ChannelsConfig = {
  email: {
    nodemailer: NodemailerConfig;
  };
};
