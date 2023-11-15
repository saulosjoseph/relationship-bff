import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { NewSolicitation } from './app.validator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post()
  newSolicitation(@Body() newSolicitation: NewSolicitation): string {
    switch (newSolicitation.subject) {
      case "Problemas com cartão":
        this.appService.sendToCardsTeam(newSolicitation.body);
        break;
      case "contratação de empréstimo":
        // this.appService.sendToLoanTeam();
        break;
      default:
        // this.appService.sendToOthersTeam();
        break;
    }

    return "Solicitation success sended!"
  }
}
