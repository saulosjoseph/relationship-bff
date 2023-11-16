import { Cache } from 'cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Solicitation } from './solicitation-queue.interfaces';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NewSolicitation } from 'apps/relationship-bff/src/app.validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SolicitationQueueService {
  private readonly logger = new Logger(SolicitationQueueService.name);
  constructor(
    @InjectQueue('solicitation-queue') private solicitationQueue: Queue,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('SUPPORT_SERVICE') private supportService: ClientProxy
  ) { }

  async newSolicitation(solicitation: Solicitation): Promise<void> {
    let awaitProcessingList = await this.cacheManager.get<Array<Solicitation> | undefined>('await_processing');
    if (awaitProcessingList === undefined) {
      awaitProcessingList = [];
    }
    try {
      this.logger.log('Sending to team!');
      const attendant = await firstValueFrom(this.supportService.send({ cmd: 'attach-solicitation-to-support' }, solicitation));
      if (attendant) {
        this.logger.log(
          `Solicitation ${JSON.stringify(solicitation)} is being processed`
        );
      } else {
        this.logger.log("Sending to await list!")
        this.awaitSolicitation(solicitation, awaitProcessingList)
      }
    } catch (error) {
      this.logger.log("Sending to await list!")
      this.awaitSolicitation(solicitation, awaitProcessingList)
    }
  }

  async awaitSolicitation(solicitation: Solicitation, awaitProcessingList: Array<NewSolicitation>): Promise<void> {
    awaitProcessingList.push(solicitation)
    await this.cacheManager.set('await_processing', awaitProcessingList, 0);
    this.logger.log(
      `Solicitation ${JSON.stringify(solicitation)} has bee add to await processing list`
    );
  }

  async moveQueue(): Promise<void> {
    const awaitProcessing = await this.cacheManager.get<Array<Solicitation> | undefined>(`await_processing`);
    if (awaitProcessing.length > 0) {
      const movedWaitProcessing = awaitProcessing.shift()
      this.solicitationQueue.add(movedWaitProcessing)
      await this.cacheManager.set(`await_processing`, awaitProcessing, 0);
      console.log(`Awaiting solicitation ${JSON.stringify(movedWaitProcessing)} sended to process!`)
    }
  }
}
