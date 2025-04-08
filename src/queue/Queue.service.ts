import { Job, JobsOptions, Queue, Worker } from 'bullmq';
import { ChannelNames } from '../common/types/ChannelNames.type';
import { RedisConfig } from '../common/types/RedisConfig.type';
import { NotificationJob } from '../common/types/NotificationJob.type';

export class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private redisConfig: RedisConfig;

  constructor(redisConfig: RedisConfig) {
    this.redisConfig = redisConfig;
    this.initializeQueues();
  }

  private initializeQueues(): void {
    this.createQueue('email');
  }

  private getQueueName(channelName: ChannelNames): string {
    return `${channelName}-queue`;
  }

  private getWorkerName(channelName: ChannelNames): string {
    return `${channelName}-worker`;
  }

  private createQueue(channelName: ChannelNames): void {
    const queueName = this.getQueueName(channelName);

    const queue = new Queue(queueName, {
      connection: this.redisConfig,
    });

    this.queues.set(queueName, queue);
  }

  registerWorker(channelName: ChannelNames, processCallback: (job: Job<NotificationJob>) => Promise<void>): void {
    const queueName = this.getQueueName(channelName);
    const workerName = this.getWorkerName(channelName);

    if (this.workers.has(workerName)) {
      console.warn(`Worker for ${workerName} is already registered.`);
      return;
    }

    const worker = new Worker(queueName, processCallback, {
      connection: this.redisConfig,
      concurrency: 10,
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} failed in ${workerName}:`, error);
    });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed in ${workerName}`);
    });

    this.workers.set(workerName, worker);
  }

  async addJob(channelName: ChannelNames, data: NotificationJob, options?: JobsOptions): Promise<string> {
    const queueName = this.getQueueName(channelName);
    const queue = this.queues.get(queueName);

    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const job = await queue.add(`${channelName}-job`, data, options);
    return job.id!;
  }

  async closeAllQueues(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    this.workers.forEach((worker) => {
      closePromises.push(worker.close());
    });

    this.queues.forEach((queue) => {
      closePromises.push(queue.close());
    });

    await Promise.all(closePromises);
  }
}
