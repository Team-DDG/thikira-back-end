import { Header } from '@app/type/etc';
import { DtoUploadEvent } from '@app/type/req';
import { ResGetEventList } from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { EventService } from './event.service';

@ApiTags('restaurant/event')
@Controller('api/restaurant/event')
export class RestaurantEventController {
  @Inject()
  private readonly eventService: EventService;
  @Inject()
  private readonly utilService: UtilService;

  @Get()
  @ApiOperation({ summary: '업체 이벤트 조회' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getEventList(): Promise<ResGetEventList[]> {
    try {
      return this.eventService.getList();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @ApiOperation({ summary: '업체 이벤트 등록' })
  @ApiCreatedResponse()
  public async uploadEvent(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadEvent,
  ): Promise<void> {
    try {
      return this.eventService.upload(this.utilService.getTokenBody(header), payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
