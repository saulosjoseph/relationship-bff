import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // BullModule.forRoot({
    //   redis: {
    //     host: 'localhost',
    //     port: 6379,
    //   },
    // }),
    BullModule.registerQueue({
      name: 'cards',
    }),
    // BullModule.registerQueue({
    //   name: 'loans-team',
    // }),
    // BullModule.registerQueue({
    //   name: 'others-team',
    // })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
