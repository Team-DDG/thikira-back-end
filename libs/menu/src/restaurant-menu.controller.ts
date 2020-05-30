import { Header } from '@app/type/etc';
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
} from '@app/type/req';
import {
  ResGetGroupList,
  ResGetMenuCategoryList,
  ResGetMenuList,
  ResGetOptionList,
  ResUploadGroup,
  ResUploadMenu,
  ResUploadMenuCategory,
  ResUploadOption,
} from '@app/type/res';
import { UtilService } from '@app/util';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';

@ApiTags('restaurant/menu')
@Controller('api/restaurant/menu')
export class RestaurantMenuController {
  @Inject()
  private readonly menuService: MenuService;
  @Inject()
  private readonly utilService: UtilService;

  @Patch('group')
  @ApiOperation({ summary: '그룹 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editGroup(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditGroup,
  ): Promise<void> {
    try {
      return this.menuService.editGroup(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get('group')
  @ApiOperation({ summary: '그룹 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'menuId' })
  @ApiOkResponse({ type: [ResGetGroupList] })
  @ApiForbiddenResponse()
  public async getGroupList(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetGroupList,
  ): Promise<ResGetGroupList[]> {
    try {
      return this.menuService.getGroupList(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Delete('group/:groupId')
  @ApiOperation({ summary: '그룹 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeGroup(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveGroup,
  ): Promise<void> {
    try {
      return this.menuService.removeGroup(UtilService.parselementIds(param.groupId));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Post('group')
  @ApiOperation({ summary: '그룹 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadGroup })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadGroup(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadGroup,
  ): Promise<ResUploadGroup> {
    try {
      return this.menuService.uploadGroup(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Patch()
  @ApiOperation({ summary: '메뉴 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editMenu(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditMenu,
  ): Promise<void> {
    try {
      return this.menuService.editMenu(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get()
  @ApiOperation({ summary: '메뉴 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'menuCategoryId' })
  @ApiOkResponse({ type: [ResGetMenuList] })
  @ApiForbiddenResponse()
  public async getMenuList(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetMenuList,
  ): Promise<ResGetMenuList[]> {
    try {
      return this.menuService.getMenuList(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Delete(':menuId')
  @ApiOperation({ summary: '메뉴 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeMenu(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveMenu,
  ): Promise<void> {
    try {
      return this.menuService.removeMenu(UtilService.parselementIds(param.menuId));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Post()
  @ApiOperation({ summary: '메뉴 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadMenu })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadMenu(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadMenu,
  ): Promise<ResUploadMenu> {
    try {
      return this.menuService.uploadMenu(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Patch('category')
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async editMenuCategory(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditMenuCategory,
  ): Promise<void> {
    try {
      return this.menuService.editMenuCategory(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get('category')
  @ApiOperation({ summary: '메뉴 카테고리 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: [ResGetMenuCategoryList] })
  @ApiForbiddenResponse()
  public async getMenuCategoryList(@Headers() header: Header): Promise<ResGetMenuCategoryList[]> {
    try {
      return this.menuService.getMenuCategoryList(this.utilService.getTokenBody(header));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Delete('category/:menuCategoryId')
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeMenuCategory(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveMenuCategory,
  ): Promise<void> {
    try {

      return this.menuService.removeMenuCategory(UtilService.parselementIds(param.menuCategoryId));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Post('category')
  @ApiOperation({ summary: '메뉴 카테고리 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadMenuCategory })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadMenuCategory(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadMenuCategory,
  ): Promise<ResUploadMenuCategory> {
    try {
      return this.menuService.uploadMenuCategory(this.utilService.getTokenBody(header), payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Patch('option')
  @ApiOperation({ summary: '옵션 수정' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async editOption(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoEditOption,
  ): Promise<void> {
    try {
      return this.menuService.editOption(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Get('option')
  @ApiOperation({ summary: '옵션 리스트 불러오기' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'groupId' })
  @ApiOkResponse({ type: [ResGetOptionList] })
  @ApiForbiddenResponse()
  public async getOptionList(
    @Headers() header: Header,
    @Query(new ValidationPipe()) query: QueryGetOptionList,
  ): Promise<ResGetOptionList[]> {
    try {
      return this.menuService.getOptionList(query);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Delete('option/:optionId')
  @ApiOperation({ summary: '옵션 삭제' })
  @ApiBearerAuth()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  public async removeOption(
    @Headers() header: Header,
    @Param(new ValidationPipe()) param: ParamRemoveOption,
  ): Promise<void> {
    try {
      return this.menuService.removeOption(UtilService.parselementIds(param.optionId));
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }

  @Post('option')
  @ApiOperation({ summary: '옵션 업로드' })
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ResUploadOption })
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  public async uploadOption(
    @Headers() header: Header,
    @Body(new ValidationPipe()) payload: DtoUploadOption,
  ): Promise<ResUploadOption> {
    try {
      return this.menuService.uploadOption(payload);
    } catch (element) {
      throw new InternalServerErrorException(element.message);
    }
  }
}
