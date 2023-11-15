import { Controller, Get } from '@nestjs/common';
import { SupportTeamsMsService } from './support-teams-ms.service';
import { MessagePattern } from '@nestjs/microservices';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';
import { Support } from './support-teams.interface';

@Controller()
export class SupportTeamsMsController {
  private supportTeam: Array<Support> = [{
    id: 1,
    name: 'AtendenteCards00',
    processingSolicitations: []
  }, {
    id: 2,
    name: 'AtendenteCards01',
    processingSolicitations: []
  }, {
    id: 3,
    name: 'AtendenteCards02',
    processingSolicitations: []
  }];
  constructor(private readonly supportTeamsMsService: SupportTeamsMsService) { }

  @MessagePattern({ cmd: 'attach-solicitation-to-support' })
  attachSolicitationToSupport(solicitation: Solicitation): boolean {
    console.log("Solicitation captured by team!")
    const supportId = this.supportTeamsMsService.getAttendantWithFewerSolicitations(this.supportTeam);
    if (supportId === -1) {
      console.log("Support full of solicitations!")
      return false;
    } else {
      console.log(`${supportId} with ${JSON.stringify(solicitation)}`)
      this.supportTeamsMsService.setSolicitationToAttendant(supportId, solicitation, this.supportTeam);
      return true;
    }
  }
}
