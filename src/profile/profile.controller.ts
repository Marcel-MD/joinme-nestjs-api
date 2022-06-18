import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { User } from 'src/auth/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from 'src/auth/user.service';

@ApiTags('Profiles')
@Controller('/profiles')
export class ProfilesController {
  constructor(
    @Inject(ProfileService)
    private readonly profileService: ProfileService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(@Body() input: CreateProfileDto, @CurrentUser() user: User) {
    if (await this.profileService.findOne(user.id)) {
      throw new BadRequestException(['You have already created a profile']);
    } else {
      return await this.profileService.createProfile(input, user);
    }
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() input: UpdateProfileDto,
    @CurrentUser() user: User,
  ) {
    const profileUser = await this.profileService.findOne(id);
    if (!profileUser) {
      throw new NotFoundException();
    }

    if (profileUser.userId === user.id || user.roles.includes(Role.Admin)) {
      return await this.profileService.updateProfile(input, profileUser);
    } else {
      throw new ForbiddenException([
        'You are not authorized to change this profile',
      ]);
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const profileUser = await this.profileService.findOne(id);
    if (!profileUser) {
      throw new NotFoundException();
    }
    if (profileUser.userId === user.id || user.roles.includes(Role.Admin)) {
      await this.profileService.deleteProfile(id);
      await this.userService.delete(id);
    } else {
      throw new ForbiddenException([
        'You are not authorized to change this profile',
      ]);
    }
  }

  @Get()
  async findAll() {
    const profiles = await this.profileService.findAll();
    return profiles;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const profile = await this.profileService.findOne(id);

    if (!profile) {
      throw new NotFoundException();
    }

    return profile;
  }

  @Put('/subscribe/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async subscribe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const profile = await this.profileService.subscribe(id, user);
    return profile;
  }

  @Put('/unsubscribe/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async unsubscribe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    const profile = await this.profileService.unsubscribe(id, user);
    return profile;
  }
}
