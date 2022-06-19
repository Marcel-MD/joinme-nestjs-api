import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Event } from './event.entity';
import { Category } from 'src/enums/categoryEnum';
import { CreateEventDto } from './dto/create-event.dto';
import { User } from 'src/auth/user.entity';
import { UpdateEventDto } from './dto/update-event.dto';
import { ProfileService } from 'src/profile/profile.service';
import EmailService from 'src/email/email.service';
@Injectable()
export class EventService {
  constructor(
    private readonly emailService: EmailService,
    private readonly profileService: ProfileService,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  private readonly logger = new Logger(EventService.name);

  private checkCategory(category: string): boolean {
    const enumValue = Category[category];
    if (!enumValue)
      throw new NotFoundException([
        `Event with category '${category}' not found`,
      ]);
    return true;
  }

  public async findAll(): Promise<Event[]> {
    this.logger.debug(`Getting all events`);
    return await this.eventRepository.find({
      relations: ['attendees'],
      join: {
        alias: 'event',
        leftJoinAndSelect: {
          user: 'event.user',
          profile: 'user.profile',
        },
      },
    });
  }

  public async findByCategory(category: string): Promise<Event[]> {
    this.logger.debug(`Getting events by category ${category}`);
    this.checkCategory(category);
    return await this.eventRepository.find({
      where: { category: Category[category] },
      relations: ['attendees'],
      join: {
        alias: 'event',
        leftJoinAndSelect: {
          user: 'event.user',
          profile: 'user.profile',
        },
      },
    });
  }

  public async findByName(name: string): Promise<Event[]> {
    this.logger.debug(`Getting events by name ${name}`);
    return await this.eventRepository.find({
      where: { name },
      relations: ['attendees'],
      join: {
        alias: 'event',
        leftJoinAndSelect: {
          user: 'event.user',
          profile: 'user.profile',
        },
      },
    });
  }

  public async findById(id: number): Promise<Event> {
    this.logger.debug(`Getting event by id ${id}`);
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['attendees'],
      join: {
        alias: 'event',
        leftJoinAndSelect: {
          user: 'event.user',
          profile: 'user.profile',
        },
      },
    });
    if (!event) throw new NotFoundException(`Event with id '${id}' not found`);
    return event;
  }

  public async create(input: CreateEventDto, user: User): Promise<Event> {
    this.logger.debug('Creating event with user ' + user.id);
    this.checkCategory(input.category);
    const event = await this.eventRepository.save({
      ...input,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      category: Category[input.category],
      userId: user.id,
    });

    if (!event) {
      throw new BadRequestException(['Somethig is worong with your event.']);
    }

    const profile = await this.profileService.findOne(user.id);

    if (!profile) {
      throw new NotFoundException(['Profile not found.']);
    }

    for (let u of profile.subscribers) {
      this.emailService.sendMailToId(
        `<strong>${profile.firstName} ${profile.lastName}</strong> created a new event called <strong>${event.name}</strong>. 
                Check it out at <strong>JoinMe</strong>.`,
        `New event from ${profile.firstName} ${profile.lastName}`,
        u.id,
      );
    }

    return event;
  }

  public async update(
    input: UpdateEventDto,
    id: number,
    user: User,
  ): Promise<Event> {
    this.logger.debug(`Updating event '${input.name}'`);

    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });
    if (!event) {
      throw new NotFoundException();
    }

    if (event.userId !== user.id) {
      throw new ForbiddenException([
        'You are not authorized to change this event',
      ]);
    }

    if (input.category) this.checkCategory(input.category);

    const newEvent = await this.eventRepository.save({
      ...event,
      ...input,
      startTime: input.startTime ? new Date(input.startTime) : event.startTime,
      endTime: input.endTime ? new Date(input.endTime) : event.endTime,
      category: input.category ? Category[input.category] : event.category,
    });

    if (!newEvent) {
      throw new BadRequestException(['Somethig is worong with your event.']);
    }

    const profile = await this.profileService.findOne(user.id);

    if (!profile) {
      throw new NotFoundException(['Profile not found.']);
    }

    for (let u of event.attendees) {
      this.emailService.sendMailToId(
        `<strong>${profile.firstName} ${profile.lastName}</strong> updated the event <strong>${event.name}</strong>. 
                Check it out at <strong>JoinMe</strong>.`,
        `Event ${event.name} updated`,
        u.id,
      );
    }

    return newEvent;
  }

  public async delete(id: number, user: User): Promise<DeleteResult> {
    this.logger.debug(`Deleting event '${id}'`);

    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException();
    }
    if (event.userId !== user.id) {
      throw new ForbiddenException([
        'You are not authorized to delete this event',
      ]);
    }
    return await this.eventRepository
      .createQueryBuilder('r')
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  public async attend(id: number, user: User): Promise<Event> {
    this.logger.debug(`User ${user.id} attending event ${id}'`);
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });
    if (!event) {
      throw new NotFoundException();
    }

    const attendees = event.attendees;
    if (attendees.filter((s) => s.id === user.id).length > 0) {
      throw new ForbiddenException(['You are already attending this event.']);
    }

    event.attendees.push(user);

    return await this.eventRepository.save(event);
  }

  public async unattend(id: number, user: User): Promise<Event> {
    this.logger.debug(`User ${user.id} unattending event ${id}'`);
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['attendees'],
    });

    if (!event) {
      throw new NotFoundException();
    }

    event.attendees = event.attendees.filter((s) => s.id !== user.id);

    return await this.eventRepository.save(event);
  }
}
