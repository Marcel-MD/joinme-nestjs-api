import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/auth/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@ApiTags('Events')
@Controller('/event')
export class EventController {
  constructor(
    @Inject(EventService)
    private readonly eventService: EventService,
  ) {}

  @Get()
  async findAll() {
    return await this.eventService.findAll();
  }

  @Get('/category/:category')
  async findByCategory(@Param('category') category: string) {
    return await this.eventService.findByCategory(category);
  }

  @Get('/name/:name')
  async findByName(@Param('name') name: string) {
    return await this.eventService.findByName(name);
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.eventService.findById(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventService.create(input, user);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Body() input: UpdateEventDto,
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.eventService.update(input, id, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.eventService.delete(id, user);
  }

  @Put('/attend/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async attend(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.eventService.attend(id, user);
  }

  @Put('/unattend/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async unsubscribe(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.eventService.unattend(id, user);
  }
}
