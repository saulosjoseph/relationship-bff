import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'solicitation-queue',
    }),
    ClientsModule.register([
      {
        name: 'SUPPORT_SERVICE',
        transport: Transport.TCP,
        options: {
          port: 3002,
        },
      },
    ])
  ],
  controllers: [AppController],
})
export class AppModule { }
