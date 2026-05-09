import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class AiGenerationService {
  constructor(@InjectQueue('survey-generation') private readonly queue: Queue) {}

  async enqueue(orgId: string, payload: Record<string, unknown>) {
    const job = await this.queue.add('generate-survey', { orgId, payload }, { attempts: 3 });
    return { queued: true, jobId: job.id };
  }
}
