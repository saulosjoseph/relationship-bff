import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { BullModule } from '@nestjs/bull';
import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { CardsSolicitationQueueProcessor } from './cards-solicitation-queue-ms.processor';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      }
    }),
    // BullModule.forRoot({
    //   redis: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
    BullModule.registerQueue({
      name: 'cards',
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
  providers: [CardsSolicitationQueueProcessor, SolicitationQueueService],
})
export class SolicitationQueueMsModule { }
