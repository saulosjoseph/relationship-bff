import { Controller, Inject, Logger } from '@nestjs/common';
import { SupportTeamsMsService } from './support-teams-ms.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';
import { CloseSolicitation, Support } from './support-teams.interface';

@Controller()
export class SupportTeamsMsController {
  private readonly logger = new Logger(SupportTeamsMsController.name);

  constructor(
    private readonly supportTeamsMsService: SupportTeamsMsService,
    @Inject('QUEUE_SERVICE') private queueService: ClientProxy
  ) { }

  @MessagePattern({ cmd: 'attach-solicitation-to-support' })
  attachSolicitationToSupport(solicitation: Solicitation): boolean {
    this.logger.log(`${JSON.stringify(solicitation)} captured by card team!`)
    const team = this.supportTeamsMsService.getSupportTeam(solicitation);
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
    const team = this.supportTeamsMsService.getSupportTeamByType(closeSolicitation.type)
    try {
      const ended = this.supportTeamsMsService.removeSolicitationFromAttendant(closeSolicitation.support, closeSolicitation.solicitation, team);
      this.queueService.emit<string>('solicitation_closed', ended);
      return true;
    } catch (error) {
      console.log(error);
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
}
