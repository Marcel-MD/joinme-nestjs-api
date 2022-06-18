import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  private readonly logger = new Logger(ProfileService.name);

  public async findOne(id: number): Promise<Profile | undefined> {
    return await this.profileRepository.findOne({
      where: { id },
      relations: ['subscribers'],
    });
  }

  public async createProfile(
    input: CreateProfileDto,
    user: User,
  ): Promise<Profile> {
    this.logger.debug('Creating profile for user ' + user.id);
    return await this.profileRepository.save({
      ...input,
      id: user.id,
      userId: user.id,
      creationDate: new Date(),
    });
  }

  public async updateProfile(
    input: UpdateProfileDto,
    profileUser: Profile,
  ): Promise<Profile> {
    this.logger.debug('Updating profile for user ' + profileUser.id);
    return await this.profileRepository.save({
      ...profileUser,
      ...input,
      updateDate: new Date(),
    });
  }

  public async deleteProfile(id: number): Promise<DeleteResult> {
    this.logger.warn('Deleting profile for user ' + id);
    return await this.profileRepository
      .createQueryBuilder('r')
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  public async findAll(): Promise<Profile[]> {
    return await this.profileRepository.find();
  }

  public async subscribe(id: number, user: User): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['subscribers'],
    });
    if (!profile) {
      throw new NotFoundException();
    }

    if (profile.userId === user.id) {
      throw new ForbiddenException([
        'You cannot subscribe to your own profile',
      ]);
    }

    const subscribers = profile.subscribers;
    if (subscribers.filter((s) => s.id === user.id).length > 0) {
      throw new ForbiddenException([
        'You are already subscribed to this profile',
      ]);
    }

    profile.subscribers.push(user);

    return await this.profileRepository.save(profile);
  }

  public async unsubscribe(id: number, user: User): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['subscribers'],
    });

    if (!profile) {
      throw new NotFoundException();
    }

    if (profile.userId === user.id) {
      throw new ForbiddenException([
        'You cannot unsubscribe from your own profile',
      ]);
    }

    profile.subscribers = profile.subscribers.filter((s) => s.id !== user.id);

    return await this.profileRepository.save(profile);
  }
}
