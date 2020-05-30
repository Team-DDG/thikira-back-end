import { UploadGroupClass } from '@app/type/etc';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class DtoUploadMenu {
  @ApiProperty() @IsNumber()
  public readonly menuCategoryId: number;
  @ApiProperty() @IsString()
  public readonly description: string;
  @ApiProperty() @IsUrl()
  public readonly image: string;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
  @ApiProperty() @IsArray() @IsOptional()
  public readonly group?: UploadGroupClass[];
}
