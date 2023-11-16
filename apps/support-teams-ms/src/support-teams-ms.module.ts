import { Module } from '@nestjs/common';
import { SupportTeamsMsController } from './support-teams-ms.controller';
import { SupportTeamsMsService } from './support-teams-ms.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      }
    }),
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
