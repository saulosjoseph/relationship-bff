import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class SolicitationQueueController {
  private readonly logger = new Logger(SolicitationQueueService.name);
  constructor(private readonly solicitationService: SolicitationQueueService) { }

  @EventPattern('move_queue')
  async handleClosedSolicitation(type: string): Promise<void> {
    this.logger.log('Moving queue!');
    this.solicitationService.moveQueue(type);
  }

  @EventPattern('new_support')
  async handleNewSupport(type: string): Promise<void> {
    this.logger.log('Moving queue!');
    console.log(type)
    this.solicitationService.setAllToNewSupport(type);
  }
}
