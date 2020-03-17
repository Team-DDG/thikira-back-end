import { ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Headers, HttpCode, HttpException, Inject, InternalServerErrorException, Query, ValidationPipe } from '@nestjs/common';
import getPrototypeOf = Reflect.getPrototypeOf;
import { QueryGetMenuCategoryList, QueryGetMenuList } from '@app/type/req';
import { ResGetMenuCategoryList, ResGetMenuList } from '@app/type/res';
import { MenuService } from '@app/menu';

@ApiTags('user/menu')
@Controller('api/user/menu')
export class UserMenuController {
  @Inject() private readonly m_service: MenuService;

  @Get('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiQuery({ name: 'r_id' })
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async get_menu_category_list(
    @Headers('authorization') token,
    @Query(new ValidationPipe()) query: QueryGetMenuCategoryList,
  ) {
    try {
      return await this.m_service.get_menu_category_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiQuery({ name: 'mc_id' })
  @ApiOkResponse({ type: [ResGetMenuList] })
  @ApiForbiddenResponse()
  public async get_menu_list(
    @Headers('authorization') token,
    @Query(new ValidationPipe()) query: QueryGetMenuList,
  ) {
    try {
      return await this.m_service.get_menu_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

}
