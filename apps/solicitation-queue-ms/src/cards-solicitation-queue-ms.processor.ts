import { OnGlobalQueueActive, OnGlobalQueueProgress, OnGlobalQueueStalled, OnGlobalQueueWaiting, OnQueueCompleted, OnQueueProgress, OnQueueRemoved, OnQueueResumed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { Solicitation } from './solicitation-queue.interfaces';

@Processor('cards')
export class CardsSolicitationQueueProcessor {
  constructor(private readonly solicitationService: SolicitationQueueService) { }

  @Process()
  async handleNewSolicitation(job: Job<Solicitation>): Promise<void> {
    console.log("Solicitation on queue!")
    this.solicitationService.newSolicitation('cards', job.data);
  }
}
