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
    @Inject('SUPPORT_SERVICE') private supportService: ClientProxy,
  ) { }

  async newSolicitation(solicitation: Solicitation): Promise<void> {
    const type = await firstValueFrom<string>(this.supportService.send({ cmd: 'get-type' }, solicitation));
    let awaitProcessingList = await this.cacheManager.get<Array<Solicitation> | undefined>(`${type}_await_processing`) || [];
    try {
      this.logger.log('Sending to team!');
      const attendant = await firstValueFrom<boolean>(this.supportService.send({ cmd: 'attach-solicitation-to-support' }, solicitation));
      if (attendant) {
        this.logger.log(
          `Solicitation ${JSON.stringify(solicitation)} is being processed`
        );
      } else {
        this.logger.log("Sending to await list!")
        this.awaitSolicitation(solicitation, awaitProcessingList, type)
      }
    } catch (error) {
      this.logger.log("Sending to await list!")
      this.awaitSolicitation(solicitation, awaitProcessingList, type)
    }
  }

  async awaitSolicitation(solicitation: Solicitation, awaitProcessingList: Array<NewSolicitation>, type: string): Promise<void> {
    awaitProcessingList.push(solicitation)
    await this.cacheManager.set(`${type}_await_processing`, awaitProcessingList, 0);
    this.logger.log(
      `Solicitation ${JSON.stringify(solicitation)} has bee add to await processing list`
    );
  }

  async moveQueue(type: string): Promise<void> {
    const awaitProcessing = await this.cacheManager.get<Array<Solicitation> | undefined>(`${type}_await_processing`) || [];
    if (awaitProcessing.length > 0) {
      const movedWaitProcessing = awaitProcessing.shift()
      this.solicitationQueue.add(movedWaitProcessing)
      await this.cacheManager.set(`${type}_await_processing`, awaitProcessing, 0);
      console.log(`Awaiting solicitation ${JSON.stringify(movedWaitProcessing)} sended to process!`)
    }
  }

  async setAllToNewSupport(type: string): Promise<void> {
    const awaitProcessing = await this.cacheManager.get<Array<Solicitation> | undefined>(`${type}_await_processing`) || [];
    console.log(awaitProcessing)
    if (awaitProcessing.length > 0) {
      console.log("chegou aqui");
      let count = awaitProcessing.length >= 3 ? 3 : awaitProcessing.length;
      while (count > 0) {
        const movedWaitProcessing = awaitProcessing.shift()
        await this.solicitationQueue.add(movedWaitProcessing)
        console.log(`Awaiting solicitation ${JSON.stringify(movedWaitProcessing)} sended to process!`)
        count = count - 1;
      }
      await this.cacheManager.set(`${type}_await_processing`, awaitProcessing, 0);
    }
  }

  async getAwaitingSolicitations(type: string): Promise<Array<Solicitation>> {
    const awaitProcessing = await this.cacheManager.get<Array<Solicitation> | undefined>(`${type}_await_processing`) || [];
    return awaitProcessing;
  }
}
