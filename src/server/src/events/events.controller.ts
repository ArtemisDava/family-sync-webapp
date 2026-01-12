import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DateRangeQueryDto } from './dto/date-range-query.dto';
import { Req } from '@nestjs/common/decorators';
import { type AuthenticatedRequest } from '../auth-check/auth-check.middleware';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
  @Post()
  create(
    @Body() createEventDto: CreateEventDto,
    @Query('userId') userId: string,
  ) {
    return this.eventsService.create(createEventDto, userId);
  }

  @Get('family/:familyId')
  findByFamily(
    @Param('familyId') familyId: string,
    @Query('userId') userId?: string,
  ) {
    return this.eventsService.findByFamily(familyId, userId);
  }

  @Get('child/:childId')
  findByChild(@Param('childId') childId: string) {
    return this.eventsService.findByChild(childId);
  }

  @Post('child/:childId')
  createForChild(
    @Param('childId') childId: string,
    @Body() createEventDto: CreateEventDto,
    @Req() { user }: AuthenticatedRequest,
  ) {
    return this.eventsService.createForChild(
      childId,
      createEventDto,
      user.userId,
    );
  }

  @Post('adult/:familyId')
  createForAdult(
    @Param('familyId') familyId: string,
    @Body() createEventDto: CreateEventDto,
    @Req() { user }: AuthenticatedRequest,
  ) {
    return this.eventsService.createForAdult(
      familyId,
      createEventDto,
      user.userId,
    );
  }

  @Get('adult/:familyId')
  findByAdult(
    @Param('familyId') familyId: string,
    @Req() { user }: AuthenticatedRequest,
  ) {
    return this.eventsService.findByAdult(familyId, user.userId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.eventsService.findByUser(userId);
  }

  @Get('date-range')
  findByDateRange(@Query() q: DateRangeQueryDto) {
    return this.eventsService.findByDateRange(
      q.startDate,
      q.endDate,
      q.familyId,
      q.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: AuthenticatedRequest, // Temporärt
  ) {
    return this.eventsService.update(id, updateEventDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() { user }: AuthenticatedRequest) {
    return this.eventsService.remove(id, user.userId);
  }
}
