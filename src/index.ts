import { AdapterInstances } from './common/types/AdapterInstances.type';
import { AdapterNames } from './common/types/AdapterNames.type';
import { ChannelsConfig } from './common/types/ChannelsConfig.type';

export class Notivox {
  private adapters: Map<AdapterNames, AdapterInstances[AdapterNames]> = new Map();

  private constructor() {}

  static async init(config: ChannelsConfig): Promise<Notivox> {
    const instance = new Notivox();
    await instance.instantiateAdapters(config);
    return instance;
  }

  getAdapter<T extends AdapterNames>(adapterName: T): AdapterInstances[T] {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      throw new Error(`Adapter ${adapterName} not found`);
    }
    return adapter as AdapterInstances[T];
  }

  private async instantiateAdapters(config: ChannelsConfig): Promise<void> {
    // Check for email configuration
    if (config.email?.nodemailer) {
      const { NodemailerAdapter } = await import('./channels/email/adapters/nodemailer.adapter');
      // Pass Redis config if available
      const redisConfig = config.queue?.redis;
      this.adapters.set('nodemailer', new NodemailerAdapter(config.email.nodemailer, redisConfig));
    }
  }
}
