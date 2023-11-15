import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SupportTeamsMsModule } from './support-teams-ms.module';

async function bootstrap() {

  const app = await NestFactory.create(SupportTeamsMsModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 3002,
    },
  });
  await app.startAllMicroservices();
}
bootstrap();
