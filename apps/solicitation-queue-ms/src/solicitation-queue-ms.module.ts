import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { BullModule } from '@nestjs/bull';
import { SolicitationQueueService } from './solicitation-queue-ms.service';
import { CardsSolicitationQueueProcessor } from './solicitation-queue-ms.processor';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SolicitationQueueController } from './solicitation-queue-ms.controller';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: 'localhost',
        port: 6379,
      }
    }),
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
  controllers: [SolicitationQueueController],
  providers: [CardsSolicitationQueueProcessor, SolicitationQueueService],
})
export class SolicitationQueueMsModule { }
