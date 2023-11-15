import { Module } from '@nestjs/common';
import { SupportTeamsMsController } from './support-teams-ms.controller';
import { SupportTeamsMsService } from './support-teams-ms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'QUEUE_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3001,
        },
      },
    ])
  ],
  controllers: [SupportTeamsMsController],
  providers: [SupportTeamsMsService],
})
export class SupportTeamsMsModule { }
