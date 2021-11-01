import { HttpService } from '@nestjs/axios';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import parseXlsx from 'excel';
import { Config } from 'src/config';
import { NewStudentInput } from './dtos/new.student.input';
import { JobNotifications } from './job.notifications';

@Processor('excel_job')
export class JobProcessor {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(
    private noificationService: JobNotifications,
    private httpService: HttpService,
  ) {}

  @OnQueueCompleted()
  onComplete(job: Job, result: any) {
    job.isFailed().then((res) => {
      this.logger.error(new Date().toUTCString() + ' - ' + res);
      if (!res) {
        this.noificationService.sendSuccessMessages(
          'Excel Job has completed Successfully',
        );
      }
    });
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(new Date().toUTCString() + ' - ' + err.message);
    this.noificationService.sendFailedMessages(err.message);
  }

  @OnQueueError()
  onError(err: Error) {
    this.logger.error(new Date().toUTCString() + ' - ' + err.message);
    this.noificationService.sendFailedMessages(err.message);
  }

  @Process('excel_upload')
  async handleExcelUpload(job: Job<unknown>) {
    this.logger.log(job.id);
    const data: any = job.data;
    try {
      await parseXlsx(data.file).then(async (data) => {
        const students: NewStudentInput[] = [];
        let std;
        for (let i = 1; i < data.length; i++) {
          std = new NewStudentInput();
          std.firstName = data[i][0];
          std.lastName = data[i][1];
          std.dbo = data[i][2] ? new Date(data[i][2].substring(1)) : new Date();

          students.push(std);
        }

        const request = {
          url: Config.graphQLEndPoint,
          method: 'post',
          data: {
            query: `mutation addStudents($newStudentsData: [NewStudentInput!]!){
              addStudents(newStudentsData: $newStudentsData) {id}
            }`,
            variables: {
              newStudentsData: students,
            },
          },
        };

        await this.httpService.post(request.url, request.data).toPromise();
      });
    } catch (e) {
      this.logger.error(e.message);
    }
  }
}
