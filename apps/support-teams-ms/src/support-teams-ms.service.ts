import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Support } from './support-teams.interface';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';

@Injectable()
export class SupportTeamsMsService {
  constructor() { }

  getAttendantWithFewerSolicitations(supportTeam: Array<Support>): number {
    const attendantWithfewerSolicitations = {
      id: 0,
      solicitations: Infinity
    };
    supportTeam.forEach(attendat => {
      if (attendat.processingSolicitations.length <= attendantWithfewerSolicitations.solicitations) {
        attendantWithfewerSolicitations.id = attendat.id;
        attendantWithfewerSolicitations.solicitations = attendat.processingSolicitations.length;
      }
    });
    if (attendantWithfewerSolicitations.solicitations >= 1) {
      return -1;
    }
    return attendantWithfewerSolicitations.id;
  }

  setSolicitationToAttendant(attendantId: number, solicitation: Solicitation, supportTeam: Array<Support>): void {
    const indexAttendant = supportTeam.findIndex(attendant => attendant.id === attendantId);
    supportTeam[indexAttendant].processingSolicitations.push(solicitation);
  }

  removeSolicitationFromAttendant(attendantId: number, solicitationId: string, supportTeam: Array<Support>): Solicitation {
    const indexAttendant = supportTeam.findIndex(attendant => attendant.id === attendantId);
    const indexSolicitation = supportTeam[indexAttendant].processingSolicitations.findIndex(processingSolicitation => processingSolicitation.id === solicitationId);
    if (indexSolicitation === -1) {
      throw new HttpException(
        'No processing solicitation.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const solicitation = JSON.parse(JSON.stringify(supportTeam[indexAttendant].processingSolicitations[indexSolicitation])) as Solicitation;
    supportTeam[indexAttendant].processingSolicitations.splice(indexSolicitation, 1);
    return solicitation;
  }

  getSolicitationsByAttendant(attendantId: number, supportTeam: Array<Support>): Support {
    return supportTeam.filter(attendant => attendant.id === attendantId)[0];
  }
}
