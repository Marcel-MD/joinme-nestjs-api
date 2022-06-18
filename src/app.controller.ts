import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import EmailService from './email/email.service';

@ApiTags('Hello')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  mailHello(): void {
    this.emailService.sendMail(
      'Hello, are you interested in joinging our hackathon?',
      'Hackathon',
      'hackathon@mailinator.com',
    );
  }
}
