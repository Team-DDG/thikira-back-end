import { JwtAuthGuard } from '@app/auth';
import { DtoUploadEvent, ResGetEventList } from '@app/type';
import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EventService } from './event.service';

@ApiTags('restaurant/event')
@Controller('api/restaurant/event')
export class RestaurantEventController {
  @Inject()
  private readonly event_service: EventService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 이벤트 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getEventList(): Promise<ResGetEventList[]> {
    try {
      return this.event_service.getList();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '업체 이벤트 등록' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  public async uploadEvent(@Body(new ValidationPipe()) payload: DtoUploadEvent): Promise<void> {
    try {
      return this.event_service.upload(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
