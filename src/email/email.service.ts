import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export default class EmailService {
  private nodemailerTransport: Mail;
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.nodemailerTransport = createTransport({
      service: configService.get('EMAIL_SERVICE'),
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendMail(html: string, subject: string, to: string) {
    try {
      const info = await this.nodemailerTransport.sendMail({
        from: '"JoinMe 🤗" <' + this.configService.get('EMAIL_USER') + '>',
        to: to,
        subject: subject,
        html: html,
      });

      this.logger.debug('Email sent:');
      console.log(info);
    } catch (error) {
      console.log(error);
    }
  }

  async sendMailToId(html: string, subject: string, toId: number) {
    try {
      const user = await this.userRepository.findOne({ where: { id: toId } });

      if (!user) {
        throw new NotFoundException();
      }

      const info = await this.nodemailerTransport.sendMail({
        from: '"JoinMe 🤗" <' + this.configService.get('EMAIL_USER') + '>',
        to: user.email,
        subject: subject,
        html: html,
      });

      this.logger.debug('Email sent:');
      console.log(info);
    } catch (error) {
      console.log(error);
    }
  }
}
