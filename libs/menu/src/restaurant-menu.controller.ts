import { JwtAuthGuard } from '@app/auth';
import {
  DtoEditGroup,
  DtoEditMenu,
  DtoEditMenuCategory,
  DtoEditOption,
  DtoUploadGroup,
  DtoUploadMenu,
  DtoUploadMenuCategory,
  DtoUploadOption,
  ParamRemoveGroup,
  ParamRemoveMenu,
  ParamRemoveMenuCategory,
  ParamRemoveOption,
  QueryGetGroupList,
  QueryGetMenuList,
  QueryGetOptionList,
  RequestClass,
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('restaurant/menu')
@Controller('api/restaurant/menu')
export class RestaurantMenuController {
  @Inject()
  private readonly menu_service: MenuService;

  @Patch('group')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '그룹 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editGroup(@Body(new ValidationPipe()) payload: DtoEditGroup): Promise<void> {
    try {
      return this.menu_service.editGroup(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('group')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '그룹 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'm_id' })
  @ApiOkResponse({ type: [ResGetGroupList] })
  @ApiForbiddenResponse()
  public async getGroupList(
    @Query(new ValidationPipe()) query: QueryGetGroupList,
  ): Promise<ResGetGroupList[]> {
    try {
      return this.menu_service.getGroupList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('group/:g_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeGroup(@Param(new ValidationPipe()) param: ParamRemoveGroup): Promise<void> {
    try {
      return this.menu_service.removeGroup(UtilService.parseIds(param.g_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('group')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '그룹 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadGroup })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadGroup(@Body(new ValidationPipe()) payload: DtoUploadGroup): Promise<ResUploadGroup> {
    try {
      return this.menu_service.uploadGroup(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editMenu(@Body(new ValidationPipe()) payload: DtoEditMenu): Promise<void> {
    try {
      return this.menu_service.editMenu(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

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

  @Delete(':m_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeMenu(@Param(new ValidationPipe()) param: ParamRemoveMenu): Promise<void> {
    try {
      return this.menu_service.removeMenu(UtilService.parseIds(param.m_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadMenu })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadMenu(@Body(new ValidationPipe()) payload: DtoUploadMenu): Promise<ResUploadMenu> {
    try {
      return this.menu_service.uploadMenu(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async editMenuCategory(@Body(new ValidationPipe()) payload: DtoEditMenuCategory): Promise<void> {
    try {
      return this.menu_service.editMenuCategory(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async getMenuCategoryList(@Req() { user: { id } }: RequestClass): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.menu_service.getMenuCategoryList(id);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('category/:mc_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeMenuCategory(
    @Param(new ValidationPipe()) param: ParamRemoveMenuCategory,
  ): Promise<void> {
    try {

      return this.menu_service.removeMenuCategory(UtilService.parseIds(param.mc_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('category')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '메뉴 카테고리 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadMenuCategory })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadMenuCategory(
    @Req() { user: { id } }: RequestClass,
    @Body(new ValidationPipe()) payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    try {
      return this.menu_service.uploadMenuCategory(id, payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Patch('option')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '옵션 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editOption(@Body(new ValidationPipe()) payload: DtoEditOption): Promise<void> {
    try {
      return this.menu_service.editOption(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Get('option')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '옵션 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'g_id' })
  @ApiOkResponse({ type: [ResGetOptionList] })
  @ApiForbiddenResponse()
  public async getOptionList(
    @Query(new ValidationPipe()) query: QueryGetOptionList,
  ): Promise<ResGetOptionList[]> {
    try {
      return this.menu_service.getOptionList(query);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Delete('option/:o_id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '옵션 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeOption(@Param(new ValidationPipe()) param: ParamRemoveOption): Promise<void> {
    try {
      return this.menu_service.removeOption(UtilService.parseIds(param.o_id));
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  @Post('option')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '옵션 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadOption })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadOption(@Body(new ValidationPipe()) payload: DtoUploadOption): Promise<ResUploadOption> {
    try {
      return this.menu_service.uploadOption(payload);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }
}
