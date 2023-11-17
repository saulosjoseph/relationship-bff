import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { NewSupport, Support } from './support-teams.interface';
import { Solicitation } from 'apps/solicitation-queue-ms/src/solicitation-queue.interfaces';

@Injectable()
export class SupportTeamsMsService {

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

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
    if (attendantWithfewerSolicitations.solicitations >= 3) {
      return '';
    }
    return attendantWithfewerSolicitations.id;
  }

  async updateTeam(type: string, supportTeam: Array<Support>): Promise<void> {
    switch (type) {
      case "cards":
        await this.cacheManager.set('cards_support_team', supportTeam, 0);
        break;
      case "loans":
        await this.cacheManager.set('loans_support_team', supportTeam, 0);
        break;
      default:
        await this.cacheManager.set('others_support_team', supportTeam, 0);
        break;
    }
  }

  async setSolicitationToAttendant(attendantId: string, solicitation: Solicitation, supportTeam: Array<Support>): Promise<void> {
    const indexAttendant = supportTeam.findIndex(attendant => attendant.id === attendantId);
    supportTeam[indexAttendant].processingSolicitations.push(solicitation);
    const type = this.getType(solicitation);
    this.updateTeam(type, supportTeam)
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
    const type = this.getType(solicitation);
    this.updateTeam(type, supportTeam)
    return solicitation;
  }

  getSolicitationsByAttendant(supportId: string, supportTeam: Array<Support>): Support {
    return supportTeam.filter(attendant => attendant.id === supportId)[0];
  }

  async getSupportTeam(solicitation: Solicitation): Promise<Array<Support>> {
    switch (solicitation.subject) {
      case "Problemas com cartão":
        return this.cacheManager.get<Array<Support> | undefined>('cards_support_team') || [];
      case "contratação de empréstimo":
        return this.cacheManager.get<Array<Support> | undefined>('loans_support_team') || [];
      default:
        return this.cacheManager.get<Array<Support> | undefined>('others_support_team') || [];
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

  async getSupportTeamByType(type: string): Promise<Array<Support>> {
    switch (type) {
      case "cards":
        return await this.cacheManager.get<Array<Support> | undefined>('cards_support_team') || [];
      case "loans":
        return await this.cacheManager.get<Array<Support> | undefined>('loans_support_team') || [];
      default:
        return await this.cacheManager.get<Array<Support> | undefined>('others_support_team') || [];
    }
  }

  async newSupport(newSupport: NewSupport): Promise<Support> {
    const newSuport: Support = {
      id: uuidv4(),
      name: newSupport.name,
      processingSolicitations: []
    };
    switch (newSupport.type) {
      case "cards":
        let teamCards = await this.cacheManager.get<Array<Support> | undefined>('cards_support_team') || [];
        teamCards.push(newSuport);
        await this.cacheManager.set('cards_support_team', teamCards, 0);
        break;
      case "loans":
        let teamLoans = await this.cacheManager.get<Array<Support> | undefined>('loans_support_team') || [];
        teamLoans.push(newSuport);
        await this.cacheManager.set('loans_support_team', teamLoans, 0);
        break;
      default:
        let teamOthers = await this.cacheManager.get<Array<Support> | undefined>('others_support_team') || [];
        teamOthers.push(newSuport)
        await this.cacheManager.set('others_support_team', teamOthers, 0);
        break;
    }
    return newSuport;
  }
}
