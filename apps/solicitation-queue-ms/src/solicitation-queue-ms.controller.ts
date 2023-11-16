import { Job } from 'bull';
import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { Solicitation } from './solicitation-queue.interfaces';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class SolicitationQueueController {
  private readonly logger = new Logger(SolicitationQueueService.name);
  constructor(private readonly solicitationService: SolicitationQueueService) { }

  @EventPattern('solicitation_closed')
  async handleClosedSolicitation(job: Job<Solicitation>): Promise<void> {
    this.logger.log('Moving queue!');
    this.solicitationService.moveQueue();
  }
}
