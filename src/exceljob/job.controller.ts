import { InjectQueue } from '@nestjs/bull';
import {
  Controller,
  HttpCode,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bull';

@Controller('job')
export class JobController {
  private readonly logger = new Logger(JobController.name);

  constructor(@InjectQueue('excel_job') private readonly jobQueue: Queue) {}

  @Post('excel/upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('files'))
  async excelUpload(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(new Date().toUTCString() + ' - ' + 'Excel Upload Starting');
    try {
      await this.jobQueue.add('excel_upload', {
        file: file.destination + '/' + file.filename,
      });

      return true;
    } catch (e) {
      this.logger.error(new Date().toUTCString() + ' - ' + e.message);
    }

    return false;
  }
}
