import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MulterModule } from '@nestjs/platform-express';
import { JobController } from './job.controller';
import { JobNotifications } from './job.notifications';
import { JobProcessor } from './job.processor';

@Module({
  imports: [
    HttpModule,
    BullModule.registerQueue({
      name: 'excel_job',
    }),
    MulterModule.register({
      dest: './job/excel/upload',
    }),
  ],
  controllers: [JobController],
  providers: [JobProcessor, JobNotifications],
})
export class JobModule {}
