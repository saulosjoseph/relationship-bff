import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { Solicitation } from './solicitation-queue.interfaces';
import { Logger } from '@nestjs/common';

@Processor('solicitation-queue')
export class CardsSolicitationQueueProcessor {
  private readonly logger = new Logger(SolicitationQueueService.name);
  constructor(private readonly solicitationService: SolicitationQueueService) { }

  @Process()
  async handleNewSolicitation(job: Job<Solicitation>): Promise<void> {
    this.logger.log('Solicitation on queue!');
    this.solicitationService.newSolicitation(job.data);
  }
}
