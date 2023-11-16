import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Support } from './support-teams.interface';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupportTeamsMsService {

  private supportCardTeam: Array<Support> = [{
    id: uuidv4(),
    name: 'AtendenteCards00',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteCards01',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteCards02',
    processingSolicitations: []
  }];

  private loanstCardTeam: Array<Support> = [{
    id: uuidv4(),
    name: 'AtendenteLoans00',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteLoans01',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteLoans02',
    processingSolicitations: []
  }];

  private otherstCardTeam: Array<Support> = [{
    id: uuidv4(),
    name: 'AtendenteOthers00',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteOthers01',
    processingSolicitations: []
  }, {
    id: uuidv4(),
    name: 'AtendenteOthers02',
    processingSolicitations: []
  }];


  constructor() { }

  getAttendantWithFewerSolicitations(supportTeam: Array<Support>): string {
    const attendantWithfewerSolicitations = {
      id: '',
      solicitations: Infinity
    };
    supportTeam.forEach(attendat => {
      if (attendat.processingSolicitations.length <= attendantWithfewerSolicitations.solicitations) {
        attendantWithfewerSolicitations.id = attendat.id;
        attendantWithfewerSolicitations.solicitations = attendat.processingSolicitations.length;
      }
    });
    console.log(JSON.stringify(attendantWithfewerSolicitations))
    if (attendantWithfewerSolicitations.solicitations >= 1) {
      return '';
    }
    return attendantWithfewerSolicitations.id;
  }

  setSolicitationToAttendant(attendantId: string, solicitation: Solicitation, supportTeam: Array<Support>): void {
    const indexAttendant = supportTeam.findIndex(attendant => attendant.id === attendantId);
    supportTeam[indexAttendant].processingSolicitations.push(solicitation);
  }

  removeSolicitationFromAttendant(supportId: string, solicitationId: string, supportTeam: Array<Support>): Solicitation {
    console.log(supportId);
    const indexAttendant = supportTeam.findIndex(attendant => attendant.id === supportId);
    console.log(indexAttendant)
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

  getSolicitationsByAttendant(supportId: string, supportTeam: Array<Support>): Support {
    return supportTeam.filter(attendant => attendant.id === supportId)[0];
  }

  getSupportTeam(solicitation: Solicitation): Array<Support> {
    switch (solicitation.subject) {
      case "Problemas com cartão":
        return this.supportCardTeam;
      case "contratação de empréstimo":
        return this.loanstCardTeam;
      default:
        return this.otherstCardTeam;
    }
  }

  getType(solicitation: Solicitation): string {
    switch (solicitation.subject) {
      case "Problemas com cartão":
        return 'cards';
      case "contratação de empréstimo":
        return 'loans';
      default:
        return 'others';
    }
  }

  getSupportTeamByType(type: string): Array<Support> {
    switch (type) {
      case "cards":
        return this.supportCardTeam;
      case "loans":
        return this.loanstCardTeam;
      default:
        return this.otherstCardTeam;
    }
  }
}
