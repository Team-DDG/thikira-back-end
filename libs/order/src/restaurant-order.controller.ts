import { JwtAuthGuard } from '@app/auth';
import { DtoEditOrderStatus, RequestClass, ResGetOrderList, ResGetOrderListByRestaurant } from '@app/type';
import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Patch,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { OrderService } from './order.service';

@ApiTags('restaurant/order')
@Controller('api/restaurant/order')
export class RestaurantOrderController {
  @Inject()
  private readonly od_service: OrderService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주문 조회' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetOrderList] })
  @ApiUnauthorizedResponse()
  public async getOrderList(@Req() { user: { id } }: RequestClass): Promise<ResGetOrderListByRestaurant[]> {
    try {
      return this.od_service.getListByRestaurant(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '주문 상태 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  public async editOrderStatus(@Body(new ValidationPipe()) payload: DtoEditOrderStatus): Promise<void> {
    try {
      return this.od_service.editOrderStatus(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
