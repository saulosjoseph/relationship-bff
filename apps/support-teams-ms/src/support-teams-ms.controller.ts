import { Controller, Inject, Logger } from '@nestjs/common';
import { SupportTeamsMsService } from './support-teams-ms.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';
import { CloseSolicitation, NewSupport, Support } from './support-teams.interface';

@Controller()
export class SupportTeamsMsController {
  private readonly logger = new Logger(SupportTeamsMsController.name);

  constructor(
    private readonly supportTeamsMsService: SupportTeamsMsService,
    @Inject('QUEUE_SERVICE') private queueService: ClientProxy
  ) { }

  @MessagePattern({ cmd: 'attach-solicitation-to-support' })
  async attachSolicitationToSupport(solicitation: Solicitation): Promise<boolean> {
    this.logger.log(`${JSON.stringify(solicitation)} captured by team!`)
    const team = await this.supportTeamsMsService.getSupportTeam(solicitation) || [];
    const supportId = this.supportTeamsMsService.getAttendantWithFewerSolicitations(team);
    if (supportId === '') {
      this.logger.log("Support team is full of solicitations!")
      return false;
    } else {
      this.logger.log(`Support ${supportId} with ${JSON.stringify(solicitation)}`)
      this.supportTeamsMsService.setSolicitationToAttendant(supportId, solicitation, team);
      return true;
    }
  }

  @MessagePattern({ cmd: 'close-solicitation' })
  async closeSolicitation(closeSolicitation: CloseSolicitation): Promise<boolean> {
    const team = await this.supportTeamsMsService.getSupportTeamByType(closeSolicitation.type)
    try {
      this.supportTeamsMsService.removeSolicitationFromAttendant(closeSolicitation.support, closeSolicitation.solicitation, team);
      this.queueService.emit<string>('move_queue', closeSolicitation.type);
      return true;
    } catch (error) {
      return false;
    }
  }

  @MessagePattern({ cmd: 'get-cards' })
  async getCardsTeam(): Promise<Array<Support>> {
    return this.supportTeamsMsService.getSupportTeamByType('cards')
  }

  @MessagePattern({ cmd: 'get-loans' })
  async getLoansTeam(): Promise<Array<Support>> {
    return this.supportTeamsMsService.getSupportTeamByType('loans')
  }

  @MessagePattern({ cmd: 'get-others' })
  async getOthersTeam(): Promise<Array<Support>> {
    return this.supportTeamsMsService.getSupportTeamByType('others')
  }

  @MessagePattern({ cmd: 'get-type' })
  async getSolicitationType(solicitation: Solicitation): Promise<string> {
    return this.supportTeamsMsService.getType(solicitation)
  }

  @MessagePattern({ cmd: 'create-support' })
  async createSupport(newSupport: NewSupport): Promise<Support> {
    const response = this.supportTeamsMsService.newSupport(newSupport)
    this.queueService.emit<string>('new_support', newSupport.type);
    return response;
  }
}
