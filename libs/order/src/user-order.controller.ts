import { JwtAuthGuard } from '@app/auth';
import { DtoUploadOrder, RequestClass, ResGetOrderList, ResGetOrderListByUser } from '@app/type';
import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('user/order')
@Controller('api/user/order')
export class UserOrderController {
  @Inject()
  private readonly od_service: OrderService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiForbiddenResponse()
  public async getOrderList(@Req() { user: { id } }: RequestClass): Promise<ResGetOrderListByUser[]> {
    try {
      return this.od_service.getListByUser(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주문 등록' })
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  public async uploadOrder(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoUploadOrder,
  ): Promise<void> {
    try {
      return this.od_service.upload(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
