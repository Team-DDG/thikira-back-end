import { ResGetEventList } from '@app/type';
import { UtilService } from '@app/util';
import { Controller, Get, Inject, InternalServerErrorException } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';

@ApiTags('user/event')
@Controller('api/user/event')
export class UserEventController {
  @Inject()
  private readonly eventService: EventService;
  @Inject()
  private readonly utilService: UtilService;

  @Get()
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getEventList(): Promise<ResGetEventList[]> {
    try {
      return this.eventService.getList();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
