import { Body, Controller, Get, Inject, Logger, Param, Post } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NewSolicitation, NewSupport } from './app.validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Support } from 'apps/support-teams-ms/src/support-teams.interface';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    @InjectQueue('solicitation-queue') private solicitationQueue: Queue,
    @Inject('SUPPORT_SERVICE') private supportService: ClientProxy
  ) { }

  @Post()
  newSolicitation(@Body() newSolicitation: NewSolicitation): string {
    this.solicitationQueue.add({ ...newSolicitation, id: uuidv4() })
    this.logger.log("Solicitation sended to solicitation queue!")
    return "Solicitation success sended!"
  }

  @Post("cards/:supportId/close/:solicitationId")
  async endCardsSolicitation(@Param('supportId') supportId, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'cards' }));
  }

  @Post("loans/:supportId/close/:solicitationId")
  async endLoansSolicitation(@Param('supportId') supportId, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'loans' }));
  }

  @Post("others/:supportId/close/:solicitationId")
  async endOthersSolicitation(@Param('supportId') supportId, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'others' }));
  }

  @Get("cards")
  async getCardsSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-cards' }, {}));
  }

  @Get("loans")
  async getLoansSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-loans' }, {}));
  }

  @Get("others")
  async getOthersSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-others' }, {}));
  }

  @Post("/support")
  async createNewSupport(@Body() newSupport: NewSupport): Promise<Support> {
    return firstValueFrom(this.supportService.send({ cmd: 'create-support' }, newSupport));
  }
}
