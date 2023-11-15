import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Solicitation } from './solicitation-queue.interfaces';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SolicitationQueueService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('SUPPORT_SERVICE') private supportService: ClientProxy
  ) { }

  async newSolicitation(team: string, solicitation: Solicitation): Promise<void> {
    let awaitProcessingList = await this.cacheManager.get<Array<Solicitation> | undefined>(`await_processing_${team}`);
    if (awaitProcessingList === undefined) {
      awaitProcessingList = [];
    }
    try {
      console.log("Sending to team!")
      const attendant = await firstValueFrom(this.supportService.send({ cmd: 'attach-solicitation-to-support' }, solicitation));
      if (attendant) {
        console.log(
          `Solicitation ${JSON.stringify(solicitation)} is being processed by ${attendant}`
        );
      } else {
        console.log("Sending to await list!")
        this.awaitSolicitation(solicitation, team, awaitProcessingList)
      }
    } catch (error) {
      console.log("Sending to await list!")
      this.awaitSolicitation(solicitation, team, awaitProcessingList)
    }
  }
  async awaitSolicitation(solicitation: Solicitation, team: string, awaitProcessingList: Array<Solicitation>): Promise<void> {
    awaitProcessingList.push(solicitation)
    await this.cacheManager.set(`await_processing_${team}`, awaitProcessingList, 0);
    console.log(
      `Solicitation ${JSON.stringify(solicitation)} has bee add to await processing list`
    );
  }
}
