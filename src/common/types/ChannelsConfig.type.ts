import { NodemailerConfig } from './Nodemailer.type';
import { RedisConfig } from './RedisConfig.type';

export type ChannelsConfig = {
  email: {
    nodemailer: NodemailerConfig;
  };

  queue?: {
    redis?: RedisConfig;
  };
};
