import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bull';
import { JobModule } from './exceljob/job.module';
import { AppController } from './app.controller';
import { Config } from './config';

@Module({
  imports: [
    BullModule.forRoot({
      redis: Config.redis,
    }),
    JobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
