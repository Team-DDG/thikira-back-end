import { ApiConflictResponse, ApiForbiddenResponse, ApiHeader, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Body, Controller, Delete, Get, Headers,
  HttpCode, HttpException, Inject, InternalServerErrorException,
  Param, Patch, Post, Query, ValidationPipe,
} from '@nestjs/common';
import {
  DtoEditGroup, DtoEditMenu, DtoEditMenuCategory, DtoEditOption,
  DtoUploadGroup, DtoUploadMenu, DtoUploadMenuCategory, DtoUploadOption,
  ParamRemoveGroup, ParamRemoveMenu, ParamRemoveMenuCategory, ParamRemoveOption,
  QueryGetGroupList, QueryGetMenuList, QueryGetOptionList,
} from '@app/type/req';
import {
  ResGetGroupList,
  ResGetMenuCategoryList, ResGetMenuList, ResGetOptionList,
  ResUploadGroup, ResUploadMenu, ResUploadMenuCategory, ResUploadOption,
} from '@app/type/res';
import { MenuService } from '@app/menu';
import { UtilService } from '@app/util';
import getPrototypeOf = Reflect.getPrototypeOf;

@ApiTags('restaurant/menu')
@Controller('api/restaurant/menu')
export class RestaurantMenuController {
  @Inject() private readonly m_service: MenuService;
  @Inject() private readonly util_service: UtilService;

  @Post('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadMenuCategory })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu_category(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadMenuCategory,
  ) {
    try {
      return this.m_service.upload_menu_category(this.util_service.get_token_body(token), payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async get_menu_category_list(@Headers('authorization') token) {
    try {
      return this.m_service.get_menu_category_list(this.util_service.get_token_body(token));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('category')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async edit_menu_category(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditMenuCategory,
  ) {
    try {
      return this.m_service.edit_menu_category(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('category/:mc_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu_category(
    @Headers('authorization') token,
    @Param(new ValidationPipe()) param: ParamRemoveMenuCategory,
  ) {
    try {
      return this.m_service.remove_menu_category(UtilService.parse_ids(param.mc_id));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadMenu })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_menu(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadMenu,
  ) {
    try {
      return this.m_service.upload_menu(payload);
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
      return this.m_service.get_menu_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_menu(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditMenu,
  ) {
    try {
      return this.m_service.edit_menu(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete(':m_id')
  @HttpCode(200)
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_menu(
    @Headers('authorization') token,
    @Param(new ValidationPipe()) param: ParamRemoveMenu,
  ) {
    try {
      return this.m_service.remove_menu(UtilService.parse_ids(param.m_id));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadGroup })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_group(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadGroup,
  ) {
    try {
      return this.m_service.upload_group(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiQuery({ name: 'm_id' })
  @ApiOkResponse({ type: [ResGetGroupList] })
  @ApiForbiddenResponse()
  public async get_group_list(
    @Headers('authorization') token,
    @Query(new ValidationPipe()) query: QueryGetGroupList,
  ) {
    try {
      return this.m_service.get_group_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('group')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_group(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditGroup,
  ) {
    try {
      return this.m_service.edit_group(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('group/:g_id')
  @HttpCode(200)
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_group(
    @Headers('authorization') token,
    @Param(new ValidationPipe()) param: ParamRemoveGroup,
  ) {
    try {
      return this.m_service.remove_group(UtilService.parse_ids(param.g_id));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Post('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 업로드' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse({ type: ResUploadOption })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async upload_option(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoUploadOption,
  ) {
    try {
      return this.m_service.upload_option(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Get('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 리스트 불러오기' })
  @ApiHeader({ name: 'Authorization' })
  @ApiQuery({ name: 'g_id' })
  @ApiOkResponse({ type: [ResGetOptionList] })
  @ApiForbiddenResponse()
  public async get_option_list(
    @Headers('authorization') token,
    @Query(new ValidationPipe()) query: QueryGetOptionList,
  ) {
    try {
      return this.m_service.get_option_list(query);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Patch('option')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 수정' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async edit_option(
    @Headers('authorization') token,
    @Body(new ValidationPipe()) payload: DtoEditOption,
  ) {
    try {
      return this.m_service.edit_option(payload);
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }

  @Delete('option/:o_id')
  @HttpCode(200)
  @ApiOperation({ summary: '옵션 삭제' })
  @ApiHeader({ name: 'Authorization' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async remove_option(
    @Headers('authorization') token,
    @Param(new ValidationPipe()) param: ParamRemoveOption,
  ) {
    try {
      return this.m_service.remove_option(UtilService.parse_ids(param.o_id));
    } catch (e) {
      throw getPrototypeOf(e) === HttpException ? e : new InternalServerErrorException(e.message);
    }
  }
}
