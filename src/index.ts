import { AdapterInstances } from './common/types/AdapterInstances.type';
import { AdapterNames } from './common/types/AdapterNames.type';
import { ChannelsConfig } from './common/types/ChannelsConfig.type';

export class Notivox {
  private adapters: Map<AdapterNames, AdapterInstances[AdapterNames]> = new Map();
  private config: ChannelsConfig;

  private constructor(config: ChannelsConfig) {
    this.config = config;
  }

  static init(config: ChannelsConfig): Notivox {
    return new Notivox(config);
  }

  async getAdapter<T extends AdapterNames>(adapterName: T): Promise<AdapterInstances[T]> {
    let adapter = this.adapters.get(adapterName);
    if (adapter) return adapter as AdapterInstances[T];

    // Lazy load if not already instantiated
    await this.instantiateAdapter(adapterName);
    adapter = this.adapters.get(adapterName);

    if (!adapter) throw new Error(`Adapter ${adapterName} could not be loaded`);
    return adapter as AdapterInstances[T];
  }

  private async instantiateAdapter(adapterName: AdapterNames): Promise<void> {
    if (adapterName === 'nodemailer' && this.config.email?.nodemailer) {
      const { NodemailerAdapter } = await import('./channels/email/adapters/nodemailer.adapter');
      const redisConfig = this.config.queue?.redis;
      const adapter = new NodemailerAdapter(this.config.email.nodemailer, redisConfig);
      this.adapters.set('nodemailer', adapter);
    }
  }
}
