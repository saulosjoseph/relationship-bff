import { Body, Controller, Get, Inject, Logger, Param, Post } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { NewSolicitation, NewSupport, SupportDTO } from './app.validator';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Support } from 'apps/support-teams-ms/src/support-teams.interface';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';


@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    @InjectQueue('solicitation-queue') private solicitationQueue: Queue,
    @Inject('SUPPORT_SERVICE') private supportService: ClientProxy,
    @Inject('QUEUE_SERVICE') private queueService: ClientProxy
  ) { }

  @Post()
  @ApiOperation({ summary: 'New solicitation' })
  @ApiBody({
    type: NewSolicitation,
  })
  @ApiResponse({ status: 201, type: String })
  newSolicitation(@Body() newSolicitation: NewSolicitation): string {
    this.solicitationQueue.add({ ...newSolicitation, id: uuidv4() })
    this.logger.log("Solicitation sended to solicitation queue!")
    return "Solicitation success sended!"
  }

  @Post("cards/:supportId/close/:solicitationId")
  @ApiOperation({ summary: 'Close cards solicitation' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, type: String })
  async endCardsSolicitation(@Param('supportId') supportId: string, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'cards' }));
  }

  @Post("loans/:supportId/close/:solicitationId")
  @ApiOperation({ summary: 'Close loans solicitation' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, type: String })
  async endLoansSolicitation(@Param('supportId') supportId: string, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'loans' }));
  }

  @Post("others/:supportId/close/:solicitationId")
  @ApiOperation({ summary: 'Close others solicitation' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, type: String })
  async endOthersSolicitation(@Param('supportId') supportId: string, @Param('solicitationId') solicitationId: string): Promise<string> {
    return firstValueFrom(this.supportService.send({ cmd: 'close-solicitation' }, { support: supportId, solicitation: solicitationId, type: 'others' }));
  }

  @Get("cards")
  @ApiOperation({ summary: 'Get cards team' })
  @ApiResponse({ status: 200, type: Array<SupportDTO> })
  async getCardsSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-cards' }, {}));
  }

  @Get("loans")
  @ApiOperation({ summary: 'Get loans team' })
  @ApiResponse({ status: 200, type: Array<SupportDTO> })
  async getLoansSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-loans' }, {}));
  }

  @Get("others")
  @ApiOperation({ summary: 'Get others team' })
  @ApiResponse({ status: 200, type: Array<SupportDTO> })
  async getOthersSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.supportService.send({ cmd: 'get-others' }, {}));
  }

  @Post("/support")
  @ApiOperation({ summary: 'Create new support employee' })
  @ApiBody({
    type: NewSupport,
  })
  @ApiResponse({ status: 201, type: SupportDTO })
  async createNewSupport(@Body() newSupport: NewSupport): Promise<Support> {
    return firstValueFrom(this.supportService.send({ cmd: 'create-support' }, newSupport));
  }

  @Get("others/awaiting")
  @ApiOperation({ summary: 'Get awaiting others solicitation' })
  @ApiResponse({ status: 200, type: Array<Solicitation> })
  async getAwaitingOthersSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.queueService.send({ cmd: 'get-awaiting-solicitations' }, 'others'));
  }

  @Get("cards/awaiting")
  @ApiOperation({ summary: 'Get awaiting cards solicitation' })
  @ApiResponse({ status: 200, type: Array<Solicitation> })
  async getAwaitingCardsSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.queueService.send({ cmd: 'get-awaiting-solicitations' }, 'cards'));
  }

  @Get("loans/awaiting")
  @ApiOperation({ summary: 'Get awaiting loans solicitation' })
  @ApiResponse({ status: 200, type: Array<Solicitation> })
  async getAwaitingLoansSolicitations(): Promise<Array<Support>> {
    return firstValueFrom(this.queueService.send({ cmd: 'get-awaiting-solicitations' }, 'loans'));
  }
}
