import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppService {
  constructor(
    @InjectQueue('cards') private cardsQueue: Queue,
    // @InjectQueue('loans-team') private loansQueue: Queue,
    // @InjectQueue('others-team') private othersQueue: Queue
  ) { }

  sendToCardsTeam(body: string): void {
    this.cardsQueue.add({ solicitation: 'teste' })
    console.log("Solicitation sended to cards team!")
  }
}
