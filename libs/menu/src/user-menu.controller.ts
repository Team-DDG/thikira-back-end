import { JwtAuthGuard } from '@app/auth';
import {
  QueryGetMenuCategoryList,
  QueryGetMenuList,
  ResGetMenuCategoryList,
  ResGetMenuList,
} from '@app/type';
import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('user/menu')
@Controller('api/user/menu')
export class UserMenuController {
  @Inject()
  private readonly menu_service: MenuService;

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'mc_id' })
  @ApiOkResponse({ type: [ResGetMenuList] })
  @ApiForbiddenResponse()
  public async getMenuList(@Query(new ValidationPipe()) query: QueryGetMenuList): Promise<ResGetMenuList[]> {
    try {
      return this.menu_service.getMenuList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'r_id' })
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async getMenuCategoryList(
    @Query(new ValidationPipe()) query: QueryGetMenuCategoryList,
  ): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.menu_service.getMenuCategoryList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

}
