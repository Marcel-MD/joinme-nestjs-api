import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event]), ProfileModule, EmailModule],
  providers: [EventService],
  controllers: [EventController]
})
export class EventModule {}
