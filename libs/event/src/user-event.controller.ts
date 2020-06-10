import { JwtAuthGuard } from '@app/auth';
import { ResGetEventList } from '@app/type';
import { Controller, Get, Inject, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EventService } from './event.service';

@ApiTags('user/event')
@Controller('api/user/event')
export class UserEventController {
  @Inject()
  private readonly event_service: EventService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '쿠폰 조회' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  public async getEventList(): Promise<ResGetEventList[]> {
    try {
      return this.event_service.getList();
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
